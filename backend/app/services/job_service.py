"""
Job management service for background tasks and scraping operations.
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid

from app.core.logging import get_logger
from app.core.exceptions import ScrapingError, AIError
from app.models.jobs import Job, JobProgress, JobError, JobResult
from app.services.s3_client import s3_client
from app.services.isr_service import isr_service
from app.scrapers.propublica import ProPublicaScraper
from app.scrapers.opensecrets import OpenSecretsScraper
from app.scrapers.campaign_websites import CampaignWebsiteScraper
from app.services.ai_service import ai_service

logger = get_logger(__name__)


class JobService:
    """Service for managing background jobs."""

    def __init__(self):
        self.propublica = ProPublicaScraper()
        self.opensecrets = OpenSecretsScraper()
        self.campaign_scraper = CampaignWebsiteScraper()
        self.running_jobs: Dict[str, Job] = {}

    async def create_job(self, job_type: str, metadata: Optional[Dict[str, Any]] = None) -> Job:
        """
        Create a new job.

        Args:
            job_type: Type of job ("update-all", "scrape-official", "summarize")
            metadata: Optional metadata for the job

        Returns:
            Created job object
        """
        job_id = f"job-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}-{str(uuid.uuid4())[:8]}"

        job = Job(
            id=job_id,
            type=job_type,
            status="pending",
            metadata=metadata or {},
        )

        # Save job to S3
        await s3_client.put_json(f"jobs/{job_id}.json", job.model_dump(mode="json"))

        logger.info("job_created", job_id=job_id, type=job_type)
        return job

    async def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID."""
        data = await s3_client.get_json(f"jobs/{job_id}.json")
        if data:
            return Job(**data)
        return None

    async def update_job(self, job: Job) -> bool:
        """Update job in S3."""
        return await s3_client.put_json(f"jobs/{job.id}.json", job.model_dump(mode="json"))

    async def list_jobs(self, limit: int = 50) -> List[Job]:
        """
        List recent jobs.

        Args:
            limit: Maximum number of jobs to return

        Returns:
            List of job objects
        """
        keys = await s3_client.list_keys("jobs/")
        jobs = []

        # Sort by most recent first
        keys.sort(reverse=True)

        for key in keys[:limit]:
            data = await s3_client.get_json(key)
            if data:
                jobs.append(Job(**data))

        return jobs

    async def scrape_official(self, member_id: str, official_id: str) -> Dict[str, Any]:
        """
        Scrape all data for a single official.

        Args:
            member_id: ProPublica member ID
            official_id: Our internal official ID (e.g., "ca-12")

        Returns:
            Complete official data
        """
        logger.info("scraping_official", official_id=official_id)

        # Scrape from ProPublica
        member_data = await self.propublica.scrape_member(member_id)
        votes = await self.propublica.scrape_votes(member_id)

        # For OpenSecrets, we'd need to map to their candidate ID
        # This is simplified - in production, maintain an ID mapping
        # donations = await self.opensecrets.scrape_all_finance_data(opensecrets_cid, "2024")

        # Calculate participation rate
        total_votes = len(votes)
        votes_cast = len([v for v in votes if v["vote"] not in ["not-voting"]])
        participation_rate = (votes_cast / total_votes * 100) if total_votes > 0 else 0

        # Generate AI summary for votes
        if votes:
            vote_summary = await ai_service.summarize_voting_record(
                votes, member_data["name"], participation_rate
            )
        else:
            vote_summary = None

        # Compile official data
        official_data = {
            "id": official_id,
            "type": "representative" if member_data.get("district") else "senator",
            "personal": {
                "name": member_data["name"],
                "party": member_data["party"],
                "state": member_data["state"],
                "district": member_data.get("district"),
                "photoUrl": member_data.get("photoUrl"),
                "contactInfo": member_data.get("contact"),
            },
            "reElection": {
                "nextElection": member_data.get("nextElection"),
                "termEnd": None,
                "previousResults": [],
            },
            "promises": {
                "lastUpdated": datetime.utcnow().isoformat(),
                "items": [],
                "aiSummary": None,
            },
            "metadata": {
                "createdAt": datetime.utcnow().isoformat(),
                "lastScraped": datetime.utcnow().isoformat(),
                "dataVersion": "1.0.0",
            },
        }

        # Save to S3
        state = member_data["state"].lower()
        district = member_data.get("district")
        if district:
            filename = f"district_{district}.json"
        else:
            # For senators, use senator_1 or senator_2
            filename = "senator_1.json"  # TODO: Logic to determine 1 or 2

        await s3_client.put_json(f"officials/{state}/{filename}", official_data)

        # Save votes separately
        votes_data = {
            "officialId": official_id,
            "year": datetime.utcnow().year,
            "lastUpdated": datetime.utcnow().isoformat(),
            "votes": votes,
            "aiSummary": vote_summary,
            "participationRate": participation_rate,
        }

        await s3_client.put_json(
            f"votes/{official_id}/{datetime.utcnow().year}.json",
            votes_data,
        )

        logger.info("official_scraped", official_id=official_id)
        return official_data

    async def update_all_officials(self, job_id: str):
        """
        Background task to update all officials.

        Args:
            job_id: Job ID to track progress
        """
        job = await self.get_job(job_id)
        if not job:
            logger.error("job_not_found", job_id=job_id)
            return

        job.status = "running"
        job.startedAt = datetime.utcnow()
        await self.update_job(job)

        try:
            # Get all members from ProPublica
            house_members = await self.propublica.get_members_list("house")
            senate_members = await self.propublica.get_members_list("senate")

            all_members = house_members + senate_members

            job.progress = JobProgress(
                total=len(all_members),
                completed=0,
                failed=0,
            )
            job.result = JobResult()

            # Process in batches
            from app.core.config import settings
            semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SCRAPES)

            async def process_member(member):
                async with semaphore:
                    try:
                        official_id = f"{member['state'].lower()}-{member.get('district', 'sen')}"
                        await self.scrape_official(member["id"], official_id)

                        job.progress.completed += 1
                        job.result.officialsUpdated += 1

                        # Trigger ISR revalidation
                        await isr_service.revalidate_official(
                            official_id, member["state"].lower()
                        )
                        job.result.isrTriggered = True

                        # Update job progress every 10 officials
                        if job.progress.completed % 10 == 0:
                            await self.update_job(job)

                    except Exception as e:
                        job.progress.failed += 1
                        job.errors.append(
                            JobError(
                                officialId=official_id,
                                error=str(e),
                            )
                        )
                        logger.error("member_scrape_failed", member_id=member["id"], error=str(e))

            # Process all members
            await asyncio.gather(*[process_member(m) for m in all_members])

            job.status = "completed"
            job.completedAt = datetime.utcnow()

            logger.info(
                "update_all_completed",
                job_id=job_id,
                updated=job.result.officialsUpdated,
                failed=job.progress.failed,
            )

        except Exception as e:
            job.status = "failed"
            job.errors.append(JobError(error=f"Job failed: {str(e)}"))
            logger.error("update_all_failed", job_id=job_id, error=str(e))

        finally:
            await self.update_job(job)

    def start_background_job(self, job_id: str):
        """
        Start a background job asynchronously.

        Args:
            job_id: Job ID to execute
        """
        asyncio.create_task(self.update_all_officials(job_id))
        logger.info("background_job_started", job_id=job_id)


# Singleton instance
job_service = JobService()
