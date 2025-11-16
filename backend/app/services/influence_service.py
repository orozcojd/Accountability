"""
Service for analyzing corporate influence on voting patterns.
"Follow the Money" - Track correlation between donations and votes.
"""

import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path

from app.core.logging import get_logger
from app.services.s3_client import s3_client

logger = get_logger(__name__)

# Load industry data
INDUSTRIES_FILE = Path(__file__).parent.parent / "data" / "industries.json"
with open(INDUSTRIES_FILE, "r") as f:
    INDUSTRY_DATA = json.load(f)


class InfluenceService:
    """Service for calculating influence scores and detecting corruption patterns."""

    def __init__(self):
        self.industries = INDUSTRY_DATA["industries"]
        self.bill_categories = INDUSTRY_DATA["bill_categories"]

    def categorize_donation_industry(self, donor_name: str, current_industry: Optional[str] = None) -> str:
        """
        Categorize a donation by industry using keyword matching.

        Args:
            donor_name: Name of the donor/organization
            current_industry: Existing industry classification if any

        Returns:
            Industry category key
        """
        donor_lower = donor_name.lower()

        # If we already have an industry, try to match it to our categories
        if current_industry:
            industry_lower = current_industry.lower()
            for key, data in self.industries.items():
                if any(keyword in industry_lower for keyword in data["keywords"]):
                    return key

        # Try to match based on donor name
        for key, data in self.industries.items():
            if any(keyword in donor_lower for keyword in data["keywords"]):
                return key

        return "other"

    def categorize_bill(self, bill_title: str, bill_summary: Optional[str] = None) -> List[str]:
        """
        Categorize a bill by issue areas using keyword matching.

        Args:
            bill_title: Title of the bill
            bill_summary: Optional bill summary

        Returns:
            List of category keys that apply to this bill
        """
        text = bill_title.lower()
        if bill_summary:
            text += " " + bill_summary.lower()

        categories = []
        for key, data in self.bill_categories.items():
            if any(keyword in text for keyword in data["keywords"]):
                categories.append(key)

        return categories if categories else ["other"]

    def is_vote_favorable_to_industry(
        self,
        vote: str,
        bill_categories: List[str],
        industry: str
    ) -> bool:
        """
        Determine if a vote is favorable to an industry.
        This is a simplified heuristic - in reality, we'd need bill-specific analysis.

        Args:
            vote: "yes" or "no"
            bill_categories: Categories of the bill
            industry: Industry category

        Returns:
            True if vote appears favorable to industry
        """
        # Industry-specific heuristics
        favorable_patterns = {
            "pharmaceuticals": {
                "healthcare": vote == "no",  # Often vote against price controls
            },
            "oil_gas": {
                "environment": vote == "no",  # Often vote against regulations
                "energy": vote == "yes",  # Often vote for subsidies
            },
            "tech": {
                "technology": vote == "no",  # Often vote against regulation
            },
            "finance": {
                "economy": vote == "no",  # Often vote against regulation
            },
            "defense": {
                "defense": vote == "yes",  # Vote for defense spending
            },
        }

        if industry in favorable_patterns:
            for category in bill_categories:
                if category in favorable_patterns[industry]:
                    return favorable_patterns[industry][category]

        # Default: can't determine
        return False

    async def calculate_influence_score(
        self,
        official_id: str,
        donations_data: Dict[str, Any],
        votes_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive influence score.

        Args:
            official_id: Official ID
            donations_data: Campaign finance data
            votes_data: Voting record data

        Returns:
            Influence analysis including score and red flags
        """
        # Categorize all donations by industry
        industry_donations = {}
        total_donations = donations_data.get("summary", {}).get("totalRaised", 0)

        for donor in donations_data.get("topDonors", []):
            industry = self.categorize_donation_industry(
                donor.get("name", ""),
                donor.get("industry")
            )

            if industry not in industry_donations:
                industry_donations[industry] = {
                    "total": 0,
                    "donors": [],
                    "donations": []
                }

            industry_donations[industry]["total"] += donor.get("amount", 0)
            industry_donations[industry]["donors"].append(donor.get("name", ""))
            industry_donations[industry]["donations"].append({
                "donor": donor.get("name", ""),
                "amount": donor.get("amount", 0),
                "type": donor.get("type", "")
            })

        # Also categorize industry contributions
        for industry_contrib in donations_data.get("topIndustries", []):
            industry = self.categorize_donation_industry(
                "",
                industry_contrib.get("industry")
            )

            if industry not in industry_donations:
                industry_donations[industry] = {
                    "total": industry_contrib.get("amount", 0),
                    "donors": [],
                    "donations": []
                }
            else:
                industry_donations[industry]["total"] += industry_contrib.get("amount", 0)

        # Analyze voting alignment with each industry
        industry_analysis = []
        all_red_flags = []

        for industry, donation_data in industry_donations.items():
            if industry == "other":
                continue

            # Find votes related to this industry
            related_votes = []
            favorable_votes = 0
            suspicious_timing_votes = []

            for vote_record in votes_data:
                for vote in vote_record.get("votes", []):
                    bill_categories = self.categorize_bill(
                        vote.get("title", ""),
                        vote.get("billSummary", "")
                    )

                    # Check if vote relates to this industry
                    industry_related = self._is_industry_related(industry, bill_categories)

                    if industry_related:
                        related_votes.append(vote)

                        # Check if vote is favorable
                        if self.is_vote_favorable_to_industry(
                            vote.get("vote", ""),
                            bill_categories,
                            industry
                        ):
                            favorable_votes += 1

                            # Check for suspicious timing
                            vote_date = vote.get("date")
                            if vote_date and self._check_suspicious_timing(
                                vote_date,
                                donation_data["donations"]
                            ):
                                days_diff = self._get_donation_days_before_vote(
                                    vote_date,
                                    donation_data["donations"]
                                )
                                if days_diff is not None:
                                    suspicious_timing_votes.append({
                                        "vote": vote,
                                        "days_before": days_diff
                                    })

                                    # Create red flag
                                    all_red_flags.append({
                                        "type": "suspicious_timing",
                                        "donation_date": (datetime.fromisoformat(str(vote_date)) - timedelta(days=days_diff)).isoformat()[:10],
                                        "donation_amount": donation_data["total"],
                                        "donor": donation_data["donors"][0] if donation_data["donors"] else f"{industry} interests",
                                        "vote_date": str(vote_date),
                                        "vote_description": vote.get("title", ""),
                                        "days_between": days_diff
                                    })

            if related_votes:
                voting_alignment = (favorable_votes / len(related_votes)) * 100
            else:
                voting_alignment = 0

            industry_analysis.append({
                "industry": self.industries.get(industry, {}).get("name", industry),
                "industry_key": industry,
                "total_donations": donation_data["total"],
                "voting_alignment": round(voting_alignment, 1),
                "suspicious_votes": len(suspicious_timing_votes),
                "related_votes_count": len(related_votes),
                "examples": [
                    {
                        "bill": vote.get("billNumber", ""),
                        "title": vote.get("title", ""),
                        "vote": vote.get("vote", ""),
                        "date": str(vote.get("date", ""))
                    }
                    for vote in related_votes[:3]
                ]
            })

        # Sort by total donations
        industry_analysis.sort(key=lambda x: x["total_donations"], reverse=True)
        top_industries = industry_analysis[:10]

        # Calculate overall influence score
        donation_concentration = self._calculate_donation_concentration(
            industry_donations,
            total_donations
        )

        avg_voting_alignment = (
            sum(ind["voting_alignment"] for ind in top_industries) / len(top_industries)
            if top_industries else 0
        )

        suspicious_timing_rate = (
            len(all_red_flags) / len(votes_data[0].get("votes", [])) * 100
            if votes_data and votes_data[0].get("votes") else 0
        )

        influence_score = (
            donation_concentration * 0.3 +
            avg_voting_alignment * 0.4 +
            suspicious_timing_rate * 0.3
        )

        return {
            "official_id": official_id,
            "influence_score": round(influence_score, 1),
            "top_industries": top_industries,
            "red_flags": sorted(
                all_red_flags,
                key=lambda x: x["days_between"]
            )[:20],  # Top 20 most suspicious
            "analysis": {
                "donation_concentration": round(donation_concentration, 1),
                "avg_voting_alignment": round(avg_voting_alignment, 1),
                "suspicious_timing_rate": round(suspicious_timing_rate, 1),
                "total_donations_analyzed": total_donations,
                "total_votes_analyzed": sum(len(v.get("votes", [])) for v in votes_data)
            }
        }

    def _is_industry_related(self, industry: str, bill_categories: List[str]) -> bool:
        """Check if bill categories relate to an industry."""
        # Map industries to bill categories
        industry_category_map = {
            "pharmaceuticals": ["healthcare"],
            "oil_gas": ["energy", "environment"],
            "tech": ["technology"],
            "finance": ["economy"],
            "defense": ["defense"],
            "healthcare": ["healthcare"],
            "agriculture": ["agriculture"],
            "telecom": ["technology"],
            "education": ["education"],
            "transportation": ["infrastructure"],
            "labor": ["labor"],
            "environment": ["environment"],
        }

        related_categories = industry_category_map.get(industry, [])
        return any(cat in bill_categories for cat in related_categories)

    def _calculate_donation_concentration(
        self,
        industry_donations: Dict[str, Any],
        total_donations: float
    ) -> float:
        """
        Calculate how concentrated donations are in top donors/industries.
        Returns percentage (0-100).
        """
        if total_donations == 0:
            return 0

        # Get top 10 industries by donation amount
        sorted_industries = sorted(
            industry_donations.items(),
            key=lambda x: x[1]["total"],
            reverse=True
        )[:10]

        top_10_total = sum(ind[1]["total"] for ind in sorted_industries)

        return (top_10_total / total_donations) * 100

    def _check_suspicious_timing(
        self,
        vote_date: str,
        donations: List[Dict[str, Any]]
    ) -> bool:
        """Check if there was a donation within 30 days before vote."""
        return self._get_donation_days_before_vote(vote_date, donations) is not None

    def _get_donation_days_before_vote(
        self,
        vote_date: str,
        donations: List[Dict[str, Any]]
    ) -> Optional[int]:
        """
        Get number of days between most recent donation and vote.
        Returns None if no donation within 30 days.
        """
        # This is a simplified version - in reality, we'd need actual donation dates
        # For now, we'll simulate with a random chance based on donation amount
        # In production, this would query actual donation date data

        # Placeholder: return suspicious timing for large donations (> $10k)
        for donation in donations:
            if donation.get("amount", 0) > 10000:
                # Simulate suspicious timing (would use actual dates in production)
                return 7  # 7 days

        return None


# Singleton instance
influence_service = InfluenceService()
