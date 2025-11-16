"""
Service for calculating comprehensive accountability score.
Combines promise keeping, transparency, attendance, and donor independence.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.logging import get_logger

logger = get_logger(__name__)


class AccountabilityScoreService:
    """Service for calculating comprehensive accountability scores."""

    # Component weights (must sum to 1.0)
    WEIGHTS = {
        "promise_keeping": 0.40,
        "transparency": 0.20,
        "constituent_alignment": 0.20,
        "attendance": 0.10,
        "donor_independence": 0.10
    }

    # Grade thresholds
    GRADE_THRESHOLDS = {
        "A": 90,
        "B": 80,
        "C": 70,
        "D": 60,
        "F": 0
    }

    def __init__(self):
        pass

    async def calculate_accountability_score(
        self,
        official_id: str,
        official_data: Dict[str, Any],
        promise_analysis: Optional[Dict[str, Any]] = None,
        influence_analysis: Optional[Dict[str, Any]] = None,
        votes_data: Optional[List[Dict[str, Any]]] = None,
        donations_data: Optional[Dict[str, Any]] = None,
        red_flags: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive accountability score.

        Args:
            official_id: Official ID
            official_data: Complete official data
            promise_analysis: Promise tracking analysis
            influence_analysis: Influence score analysis
            votes_data: Voting record data
            donations_data: Campaign finance data
            red_flags: Red flags analysis

        Returns:
            Accountability score with component breakdown
        """
        # Calculate each component score
        promise_keeping_score = self._calculate_promise_keeping_score(promise_analysis)
        transparency_score = self._calculate_transparency_score(official_data, red_flags)
        attendance_score = self._calculate_attendance_score(votes_data)
        donor_independence_score = self._calculate_donor_independence_score(
            donations_data,
            influence_analysis
        )
        constituent_alignment_score = self._calculate_constituent_alignment_score(
            votes_data,
            official_data
        )

        # Calculate weighted overall score
        overall_score = (
            promise_keeping_score * self.WEIGHTS["promise_keeping"] +
            transparency_score * self.WEIGHTS["transparency"] +
            constituent_alignment_score * self.WEIGHTS["constituent_alignment"] +
            attendance_score * self.WEIGHTS["attendance"] +
            donor_independence_score * self.WEIGHTS["donor_independence"]
        )

        overall_score = round(overall_score, 1)

        # Determine grade
        grade = self._get_grade(overall_score)

        # Determine trend (placeholder - would need historical data)
        trend = self._calculate_trend(official_id, overall_score)

        # Peer comparison (placeholder - would need peer data)
        peer_comparison = self._calculate_peer_comparison(official_id, overall_score)

        return {
            "official_id": official_id,
            "overall_score": overall_score,
            "grade": grade,
            "components": {
                "promise_keeping": {
                    "score": round(promise_keeping_score, 1),
                    "weight": int(self.WEIGHTS["promise_keeping"] * 100),
                    "weighted_contribution": round(
                        promise_keeping_score * self.WEIGHTS["promise_keeping"],
                        1
                    ),
                    "description": "How well campaign promises match voting record"
                },
                "transparency": {
                    "score": round(transparency_score, 1),
                    "weight": int(self.WEIGHTS["transparency"] * 100),
                    "weighted_contribution": round(
                        transparency_score * self.WEIGHTS["transparency"],
                        1
                    ),
                    "metrics": self._get_transparency_metrics(official_data, red_flags),
                    "description": "Accessibility and openness to constituents"
                },
                "attendance": {
                    "score": round(attendance_score, 1),
                    "weight": int(self.WEIGHTS["attendance"] * 100),
                    "weighted_contribution": round(
                        attendance_score * self.WEIGHTS["attendance"],
                        1
                    ),
                    "missed_votes_pct": self._get_missed_votes_pct(votes_data),
                    "description": "Participation in votes and committee meetings"
                },
                "donor_independence": {
                    "score": round(donor_independence_score, 1),
                    "weight": int(self.WEIGHTS["donor_independence"] * 100),
                    "weighted_contribution": round(
                        donor_independence_score * self.WEIGHTS["donor_independence"],
                        1
                    ),
                    "corporate_pac_pct": self._get_corporate_pac_pct(donations_data),
                    "influence_score": influence_analysis.get("influence_score", 0) if influence_analysis else 0,
                    "description": "Independence from corporate and special interests"
                },
                "constituent_alignment": {
                    "score": round(constituent_alignment_score, 1),
                    "weight": int(self.WEIGHTS["constituent_alignment"] * 100),
                    "weighted_contribution": round(
                        constituent_alignment_score * self.WEIGHTS["constituent_alignment"],
                        1
                    ),
                    "votes_with_district": self._get_district_alignment_pct(votes_data, official_data),
                    "description": "How well votes align with district priorities"
                }
            },
            "trend": trend,
            "peer_comparison": peer_comparison
        }

    def _calculate_promise_keeping_score(
        self,
        promise_analysis: Optional[Dict[str, Any]]
    ) -> float:
        """
        Calculate promise keeping score (0-100).

        Args:
            promise_analysis: Promise tracking analysis

        Returns:
            Score 0-100
        """
        if not promise_analysis:
            return 50.0  # Neutral score if no data

        summary = promise_analysis.get("summary", {})
        promise_score = summary.get("promise_keeping_score", 0)

        return promise_score

    def _calculate_transparency_score(
        self,
        official_data: Dict[str, Any],
        red_flags: Optional[Dict[str, Any]]
    ) -> float:
        """
        Calculate transparency score (0-100).

        Args:
            official_data: Official data
            red_flags: Red flags analysis

        Returns:
            Score 0-100
        """
        score = 100.0

        # Deduct for transparency red flags
        if red_flags:
            for flag in red_flags.get("flags", []):
                if flag.get("type") in ["low_transparency", "low_accessibility", "no_town_halls"]:
                    if flag.get("severity") == "critical":
                        score -= 20
                    elif flag.get("severity") == "high":
                        score -= 15
                    elif flag.get("severity") == "medium":
                        score -= 10
                    else:
                        score -= 5

        # Check for contact info
        contact_info = official_data.get("personal", {}).get("contactInfo", {})
        if not contact_info.get("email"):
            score -= 15
        if not contact_info.get("phone"):
            score -= 10
        if not contact_info.get("website"):
            score -= 10

        # Placeholder: would deduct for low town hall frequency, poor response rate
        # score -= (town_hall_score_deduction)
        # score -= (response_rate_deduction)

        return max(0, score)

    def _calculate_attendance_score(
        self,
        votes_data: Optional[List[Dict[str, Any]]]
    ) -> float:
        """
        Calculate attendance score (0-100).

        Args:
            votes_data: Voting record data

        Returns:
            Score 0-100
        """
        if not votes_data:
            return 50.0  # Neutral if no data

        # Calculate participation rate
        total_votes = 0
        votes_cast = 0

        for vote_record in votes_data:
            votes = vote_record.get("votes", [])
            total_votes += len(votes)

            for vote in votes:
                vote_value = vote.get("vote", "").lower()
                if vote_value not in ["not-voting", "not voting", "present", ""]:
                    votes_cast += 1

        if total_votes == 0:
            return 50.0

        participation_rate = (votes_cast / total_votes) * 100

        # Score is directly the participation rate
        return participation_rate

    def _calculate_donor_independence_score(
        self,
        donations_data: Optional[Dict[str, Any]],
        influence_analysis: Optional[Dict[str, Any]]
    ) -> float:
        """
        Calculate donor independence score (0-100).

        Args:
            donations_data: Campaign finance data
            influence_analysis: Influence analysis

        Returns:
            Score 0-100
        """
        if not donations_data:
            return 50.0  # Neutral if no data

        summary = donations_data.get("summary", {})
        total_raised = summary.get("totalRaised", 0)
        pac_contributions = summary.get("pacContributions", 0)
        individual_contributions = summary.get("individualContributions", 0)

        if total_raised == 0:
            return 50.0

        # Higher individual contribution percentage = better score
        individual_pct = (individual_contributions / total_raised) * 100

        # Adjust for influence score if available
        if influence_analysis:
            influence_score = influence_analysis.get("influence_score", 0)
            # High influence score = low independence
            independence = 100 - influence_score

            # Blend individual percentage and influence score
            score = (individual_pct * 0.5) + (independence * 0.5)
        else:
            score = individual_pct

        return score

    def _calculate_constituent_alignment_score(
        self,
        votes_data: Optional[List[Dict[str, Any]]],
        official_data: Dict[str, Any]
    ) -> float:
        """
        Calculate constituent alignment score (0-100).
        Placeholder - would need district polling/preference data.

        Args:
            votes_data: Voting record data
            official_data: Official data

        Returns:
            Score 0-100
        """
        # Placeholder: In production, would compare votes to district preferences
        # For now, return a neutral score
        # This would require:
        # - District polling data
        # - Issue importance rankings for district
        # - Comparison of votes to district preferences

        return 50.0  # Neutral score - needs real data

    def _get_grade(self, score: float) -> str:
        """Convert numerical score to letter grade."""
        for grade, threshold in self.GRADE_THRESHOLDS.items():
            if score >= threshold:
                return grade
        return "F"

    def _calculate_trend(self, official_id: str, current_score: float) -> str:
        """
        Calculate score trend.
        Placeholder - would need historical scores.

        Args:
            official_id: Official ID
            current_score: Current score

        Returns:
            "improving", "stable", or "declining"
        """
        # Placeholder: would query historical scores and compare
        return "stable"

    def _calculate_peer_comparison(
        self,
        official_id: str,
        current_score: float
    ) -> Dict[str, Any]:
        """
        Compare to peers.
        Placeholder - would need peer data.

        Args:
            official_id: Official ID
            current_score: Current score

        Returns:
            Peer comparison data
        """
        # Placeholder: would query scores for same chamber/party/etc
        return {
            "average_score": 62,  # Placeholder
            "rank": 142,  # Placeholder
            "total_peers": 150  # Placeholder
        }

    def _get_transparency_metrics(
        self,
        official_data: Dict[str, Any],
        red_flags: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get transparency metrics for component breakdown."""
        # Placeholder values - would need real data
        return {
            "town_halls_per_year": 0.5,  # Placeholder
            "constituent_response_rate": 12,  # Placeholder
            "calendar_public": False  # Placeholder
        }

    def _get_missed_votes_pct(
        self,
        votes_data: Optional[List[Dict[str, Any]]]
    ) -> float:
        """Get missed votes percentage."""
        if not votes_data:
            return 0.0

        total_votes = 0
        missed_votes = 0

        for vote_record in votes_data:
            votes = vote_record.get("votes", [])
            total_votes += len(votes)

            for vote in votes:
                vote_value = vote.get("vote", "").lower()
                if vote_value in ["not-voting", "not voting", "present", ""]:
                    missed_votes += 1

        if total_votes == 0:
            return 0.0

        return round((missed_votes / total_votes) * 100, 1)

    def _get_corporate_pac_pct(
        self,
        donations_data: Optional[Dict[str, Any]]
    ) -> float:
        """Get percentage of funding from corporate PACs."""
        if not donations_data:
            return 0.0

        summary = donations_data.get("summary", {})
        total_raised = summary.get("totalRaised", 0)
        pac_contributions = summary.get("pacContributions", 0)

        if total_raised == 0:
            return 0.0

        return round((pac_contributions / total_raised) * 100, 1)

    def _get_district_alignment_pct(
        self,
        votes_data: Optional[List[Dict[str, Any]]],
        official_data: Dict[str, Any]
    ) -> float:
        """
        Get percentage of votes aligned with district.
        Placeholder - needs district preference data.
        """
        # Placeholder
        return 34.0  # Example from requirements


# Singleton instance
accountability_score_service = AccountabilityScoreService()
