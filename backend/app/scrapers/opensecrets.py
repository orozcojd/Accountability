"""
OpenSecrets API scraper for campaign finance data.
"""

from typing import Dict, Any, List
from datetime import datetime

from app.scrapers.base import BaseScraper
from app.core.config import settings
from app.core.logging import get_logger
from app.models.donations import ContributionSummary, Donor, Industry

logger = get_logger(__name__)


class OpenSecretsScraper(BaseScraper):
    """Scraper for OpenSecrets API."""

    BASE_URL = "https://www.opensecrets.org/api"

    def __init__(self):
        super().__init__()
        self.api_key = settings.OPENSECRETS_API_KEY

    async def scrape_candidate_summary(self, cid: str, cycle: str = "2024") -> Dict[str, Any]:
        """
        Scrape campaign finance summary for a candidate.

        Args:
            cid: OpenSecrets candidate ID
            cycle: Election cycle (e.g., "2024")

        Returns:
            Dictionary with contribution summary
        """
        params = {
            "method": "candSummary",
            "cid": cid,
            "cycle": cycle,
            "apikey": self.api_key,
            "output": "json",
        }

        data = await self._make_request(self.BASE_URL, params=params)

        summary = data["response"]["summary"]["@attributes"]

        return {
            "totalRaised": float(summary.get("total", 0)),
            "individualContributions": float(summary.get("indivs", 0)),
            "pacContributions": float(summary.get("pacs", 0)),
            "selfFunding": float(summary.get("cand_contrib", 0)),
        }

    async def scrape_top_contributors(self, cid: str, cycle: str = "2024") -> List[Dict[str, Any]]:
        """
        Scrape top contributors for a candidate.

        Args:
            cid: OpenSecrets candidate ID
            cycle: Election cycle

        Returns:
            List of top donors
        """
        params = {
            "method": "candContrib",
            "cid": cid,
            "cycle": cycle,
            "apikey": self.api_key,
            "output": "json",
        }

        data = await self._make_request(self.BASE_URL, params=params)

        contributors = data["response"]["contributors"]["contributor"]
        if not isinstance(contributors, list):
            contributors = [contributors]

        donors = []
        for contrib in contributors[:20]:  # Top 20
            attrs = contrib["@attributes"]
            donors.append({
                "name": attrs["org_name"],
                "amount": float(attrs["total"]),
                "type": "PAC" if attrs.get("pacs", 0) > 0 else "Individual",
                "industry": None,  # Not available in this endpoint
            })

        logger.info("scraped_contributors", cid=cid, count=len(donors))
        return donors

    async def scrape_industries(self, cid: str, cycle: str = "2024") -> List[Dict[str, Any]]:
        """
        Scrape top industries for a candidate.

        Args:
            cid: OpenSecrets candidate ID
            cycle: Election cycle

        Returns:
            List of top industries
        """
        params = {
            "method": "candIndustry",
            "cid": cid,
            "cycle": cycle,
            "apikey": self.api_key,
            "output": "json",
        }

        data = await self._make_request(self.BASE_URL, params=params)

        industries_data = data["response"]["industries"]["industry"]
        if not isinstance(industries_data, list):
            industries_data = [industries_data]

        industries = []
        for industry in industries_data[:10]:  # Top 10
            attrs = industry["@attributes"]
            industries.append({
                "industry": attrs["industry_name"],
                "amount": float(attrs["total"]),
            })

        logger.info("scraped_industries", cid=cid, count=len(industries))
        return industries

    async def scrape_all_finance_data(self, cid: str, cycle: str = "2024") -> Dict[str, Any]:
        """
        Scrape all campaign finance data for a candidate.

        Args:
            cid: OpenSecrets candidate ID
            cycle: Election cycle

        Returns:
            Complete campaign finance data
        """
        summary = await self.scrape_candidate_summary(cid, cycle)
        donors = await self.scrape_top_contributors(cid, cycle)
        industries = await self.scrape_industries(cid, cycle)

        return {
            "cycle": cycle,
            "summary": summary,
            "topDonors": donors,
            "topIndustries": industries,
        }
