"""
ProPublica Congress API scraper for official info and voting records.
"""

from typing import Dict, Any, List
from datetime import datetime

from app.scrapers.base import BaseScraper
from app.core.config import settings
from app.core.logging import get_logger
from app.models.official import PersonalInfo, ContactInfo
from app.models.votes import Vote, VotingRecord

logger = get_logger(__name__)


class ProPublicaScraper(BaseScraper):
    """Scraper for ProPublica Congress API."""

    BASE_URL = "https://api.propublica.org/congress/v1"

    def __init__(self):
        super().__init__()
        self.api_key = settings.PROPUBLICA_API_KEY
        self.headers = {"X-API-Key": self.api_key}

    async def scrape_member(self, member_id: str) -> Dict[str, Any]:
        """
        Scrape basic information about a congress member.

        Args:
            member_id: ProPublica member ID

        Returns:
            Dictionary with member information
        """
        url = f"{self.BASE_URL}/members/{member_id}.json"
        data = await self._make_request(url, headers=self.headers)

        member = data["results"][0]

        return {
            "id": member["id"],
            "name": f"{member['first_name']} {member['last_name']}",
            "party": self._normalize_party(member["current_party"]),
            "state": member["roles"][0]["state"] if member["roles"] else None,
            "district": member["roles"][0].get("district") if member["roles"] else None,
            "chamber": member["roles"][0]["chamber"] if member["roles"] else None,
            "photoUrl": f"https://theunitedstates.io/images/congress/225x275/{member_id}.jpg",
            "contact": {
                "phone": member["roles"][0].get("phone") if member["roles"] else None,
                "website": member.get("url"),
            },
            "nextElection": member["roles"][0].get("next_election") if member["roles"] else None,
        }

    async def scrape_votes(self, member_id: str, congress: int = 118) -> List[Dict[str, Any]]:
        """
        Scrape voting records for a member.

        Args:
            member_id: ProPublica member ID
            congress: Congress number (default: 118 for current)

        Returns:
            List of vote dictionaries
        """
        url = f"{self.BASE_URL}/members/{member_id}/votes.json"
        data = await self._make_request(url, headers=self.headers)

        votes = []
        for vote in data["results"][0]["votes"]:
            votes.append({
                "id": vote["roll_call"],
                "billNumber": vote.get("bill", {}).get("number", "N/A"),
                "title": vote["description"],
                "date": vote["date"],
                "vote": vote["position"].lower(),
                "billSummary": vote.get("question"),
                "result": vote.get("result"),
            })

        logger.info("scraped_votes", member_id=member_id, count=len(votes))
        return votes

    async def get_members_list(self, chamber: str = "house", congress: int = 118) -> List[Dict[str, Any]]:
        """
        Get list of all members in a chamber.

        Args:
            chamber: "house" or "senate"
            congress: Congress number

        Returns:
            List of member dictionaries
        """
        url = f"{self.BASE_URL}/{congress}/{chamber}/members.json"
        data = await self._make_request(url, headers=self.headers)

        members = []
        for member in data["results"][0]["members"]:
            members.append({
                "id": member["id"],
                "name": f"{member['first_name']} {member['last_name']}",
                "party": self._normalize_party(member["party"]),
                "state": member["state"],
                "district": member.get("district"),
            })

        logger.info("scraped_members_list", chamber=chamber, count=len(members))
        return members
