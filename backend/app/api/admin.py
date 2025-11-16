"""
Admin API routes (protected).
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from datetime import datetime

from app.core.dependencies import get_current_admin
from app.models.auth import Session
from app.models.jobs import Job
from app.services.job_service import job_service
from app.services.s3_client import s3_client
from app.services.ai_service import ai_service
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


# Job Management Routes
@router.get("/jobs", response_model=List[Job])
async def list_jobs(limit: int = 50):
    """
    List recent background jobs.

    Requires: Admin authentication
    """
    jobs = await job_service.list_jobs(limit=limit)
    return jobs


@router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """
    Get status and details of a specific job.

    Requires: Admin authentication
    """
    job = await job_service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")

    return job


@router.post("/jobs/update-all")
async def trigger_update_all(session: Session = Depends(get_current_admin)):
    """
    Trigger a full update of all officials.

    This will scrape all data sources, generate AI summaries, and trigger ISR revalidation.

    Requires: Admin authentication
    """
    # Create job
    job = await job_service.create_job(
        job_type="update-all",
        metadata={"triggeredBy": session.email},
    )

    # Start background task
    job_service.start_background_job(job.id)

    logger.info("update_all_triggered", job_id=job.id, user=session.email)

    return {
        "jobId": job.id,
        "status": "started",
        "message": "Update job started. Monitor progress at /admin/jobs/{job_id}",
    }


@router.post("/jobs/scrape-official")
async def scrape_single_official(
    member_id: str = Body(..., embed=True),
    official_id: str = Body(..., embed=True),
    session: Session = Depends(get_current_admin),
):
    """
    Scrape data for a single official.

    Requires: Admin authentication
    """
    job = await job_service.create_job(
        job_type="scrape-official",
        metadata={
            "triggeredBy": session.email,
            "memberId": member_id,
            "officialId": official_id,
        },
    )

    try:
        # Execute synchronously for single official
        await job_service.scrape_official(member_id, official_id)

        job.status = "completed"
        await job_service.update_job(job)

        return {
            "success": True,
            "jobId": job.id,
            "officialId": official_id,
        }

    except Exception as e:
        job.status = "failed"
        job.errors = [{"error": str(e)}]
        await job_service.update_job(job)

        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


# Summary Management Routes
@router.get("/summaries")
async def list_summaries(limit: int = 100):
    """
    List all AI-generated summaries.

    Requires: Admin authentication
    """
    # Get all summary files from S3
    keys = await s3_client.list_keys("summaries/")

    summaries = []
    for key in keys[:limit]:
        data = await s3_client.get_json(key)
        if data:
            summaries.append({
                "key": key,
                "officialId": key.split("/")[1] if len(key.split("/")) > 1 else None,
                "type": key.split("/")[2].replace(".json", "") if len(key.split("/")) > 2 else None,
                "summary": data,
            })

    return {
        "summaries": summaries,
        "total": len(summaries),
    }


@router.put("/summaries/{summary_id}")
async def edit_summary(
    summary_id: str,
    summary_text: str = Body(..., embed=True),
    session: Session = Depends(get_current_admin),
):
    """
    Manually edit an AI-generated summary.

    Requires: Admin authentication
    """
    # summary_id format: "official_id:type" (e.g., "ca-12:votes")
    parts = summary_id.split(":")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid summary ID format")

    official_id, summary_type = parts

    key = f"summaries/{official_id}/{summary_type}.json"

    # Update the summary
    summary_data = await s3_client.get_json(key) or {}
    summary_data["text"] = summary_text
    summary_data["editedBy"] = session.email
    summary_data["editedAt"] = datetime.utcnow().isoformat()

    await s3_client.put_json(key, summary_data)

    logger.info("summary_edited", summary_id=summary_id, user=session.email)

    return {
        "success": True,
        "summaryId": summary_id,
        "message": "Summary updated successfully",
    }


@router.post("/summaries/{summary_id}/regenerate")
async def regenerate_summary(
    summary_id: str,
    session: Session = Depends(get_current_admin),
):
    """
    Regenerate an AI summary.

    Requires: Admin authentication
    """
    parts = summary_id.split(":")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid summary ID format")

    official_id, summary_type = parts

    # Fetch the relevant data and regenerate summary
    # This is simplified - in production, would fetch from appropriate endpoint
    try:
        if summary_type == "votes":
            votes_data = await s3_client.get_json(f"votes/{official_id}/2024.json")
            if votes_data:
                new_summary = await ai_service.summarize_voting_record(
                    votes_data["votes"],
                    official_id,
                    votes_data.get("participationRate", 0),
                )
            else:
                raise HTTPException(status_code=404, detail="Votes data not found")

        # Add other summary types as needed...

        # Save new summary
        summary_data = {
            "text": new_summary,
            "regeneratedBy": session.email,
            "regeneratedAt": datetime.utcnow().isoformat(),
        }

        await s3_client.put_json(f"summaries/{official_id}/{summary_type}.json", summary_data)

        logger.info("summary_regenerated", summary_id=summary_id, user=session.email)

        return {
            "success": True,
            "summaryId": summary_id,
            "summary": new_summary,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")


# Health Check
@router.get("/health")
async def admin_health_check():
    """
    Check system health and status.

    Requires: Admin authentication
    """
    # Check S3 connectivity
    try:
        await s3_client.exists("health-check")
        s3_status = "healthy"
    except:
        s3_status = "unhealthy"

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "s3": s3_status,
            "api": "healthy",
        },
    }
