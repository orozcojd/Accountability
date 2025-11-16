"""
Service for detecting and flagging problematic patterns.
Automatic detection of accountability issues.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid

from app.core.logging import get_logger

logger = get_logger(__name__)


class RedFlagsService:
    """Service for detecting red flags in official behavior."""

    # Configurable thresholds
    THRESHOLDS = {
        "broken_promise_rate": 0.5,  # 50% broken = red flag
        "missed_votes_rate": 0.20,  # 20% missed = red flag
        "congress_avg_missed": 0.08,  # 8% average
        "town_hall_months": 12,  # 12 months without town hall
        "constituent_response_rate": 0.30,  # 30% response rate
        "suspicious_timing_days": 30,  # Days between donation and vote
        "high_donor_concentration": 0.70,  # 70% from top donors
        "corporate_pac_threshold": 0.60,  # 60% from corporate PACs
    }

    def __init__(self):
        pass

    async def detect_red_flags(
        self,
        official_id: str,
        official_data: Dict[str, Any],
        promise_analysis: Optional[Dict[str, Any]] = None,
        influence_analysis: Optional[Dict[str, Any]] = None,
        votes_data: Optional[List[Dict[str, Any]]] = None,
        donations_data: Optional[Dict[str, Any]] = None,
        stocks_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect all red flags for an official.

        Args:
            official_id: Official ID
            official_data: Complete official data
            promise_analysis: Promise tracking analysis
            influence_analysis: Influence score analysis
            votes_data: Voting record data
            donations_data: Campaign finance data
            stocks_data: Stock trading data

        Returns:
            Red flags report with severity and details
        """
        flags = []

        # 1. Broken promises
        if promise_analysis:
            promise_flags = self._detect_broken_promise_flags(promise_analysis)
            flags.extend(promise_flags)

        # 2. Suspicious donation timing
        if influence_analysis:
            timing_flags = self._detect_suspicious_timing_flags(influence_analysis)
            flags.extend(timing_flags)

        # 3. Missed votes
        if votes_data:
            attendance_flags = self._detect_attendance_flags(votes_data)
            flags.extend(attendance_flags)

        # 4. Transparency issues
        transparency_flags = self._detect_transparency_flags(official_data)
        flags.extend(transparency_flags)

        # 5. Stock trading conflicts
        if stocks_data:
            stock_flags = self._detect_stock_conflicts(stocks_data, votes_data or [])
            flags.extend(stock_flags)

        # 6. Donor concentration
        if donations_data:
            donor_flags = self._detect_donor_concentration_flags(donations_data)
            flags.extend(donor_flags)

        # Count by severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }

        for flag in flags:
            severity = flag.get("severity", "low")
            severity_counts[severity] += 1

        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        flags.sort(key=lambda x: severity_order.get(x.get("severity", "low"), 3))

        return {
            "official_id": official_id,
            "total_red_flags": len(flags),
            "by_severity": severity_counts,
            "flags": flags
        }

    def _detect_broken_promise_flags(
        self,
        promise_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to broken promises."""
        flags = []
        summary = promise_analysis.get("summary", {})

        total = summary.get("total_promises", 0)
        broken = summary.get("broken", 0)

        if total == 0:
            return flags

        broken_rate = broken / total

        # Flag if broken promise rate exceeds threshold
        if broken_rate >= self.THRESHOLDS["broken_promise_rate"]:
            # Find most egregious broken promises
            promises = promise_analysis.get("promises", [])
            worst_promises = [
                p for p in promises
                if p.get("status") == "broken" and p.get("times_voted_against", 0) >= 5
            ]

            for promise in worst_promises[:5]:  # Top 5
                flags.append({
                    "id": str(uuid.uuid4()),
                    "type": "broken_promise",
                    "severity": "high" if promise.get("times_voted_against", 0) >= 10 else "medium",
                    "title": f"Voted against campaign promise {promise.get('times_voted_against', 0)} times",
                    "description": f"Promised to {promise.get('promise_text', '')} but voted against it {promise.get('times_voted_against', 0)} times",
                    "evidence_count": promise.get("times_voted_against", 0),
                    "first_occurrence": promise.get("evidence", [{}])[0].get("date", "") if promise.get("evidence") else "",
                    "last_occurrence": promise.get("evidence", [{}])[-1].get("date", "") if promise.get("evidence") else "",
                    "category": promise.get("category", "")
                })

        return flags

    def _detect_suspicious_timing_flags(
        self,
        influence_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to suspicious donation timing."""
        flags = []
        red_flags = influence_analysis.get("red_flags", [])

        for rf in red_flags[:10]:  # Top 10 most suspicious
            if rf.get("type") == "suspicious_timing":
                days = rf.get("days_between", 0)

                if days <= 7:
                    severity = "critical"
                elif days <= 14:
                    severity = "high"
                else:
                    severity = "medium"

                flags.append({
                    "id": str(uuid.uuid4()),
                    "type": "suspicious_timing",
                    "severity": severity,
                    "title": f"Donation followed by favorable vote within {days} days",
                    "description": f"${rf.get('donation_amount', 0):,.0f} donation from {rf.get('donor', '')}, then voted favorably on related bill",
                    "donation_date": rf.get("donation_date", ""),
                    "vote_date": rf.get("vote_date", ""),
                    "days_between": days,
                    "donation_amount": rf.get("donation_amount", 0),
                    "donor": rf.get("donor", ""),
                    "vote_description": rf.get("vote_description", "")
                })

        return flags

    def _detect_attendance_flags(
        self,
        votes_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to missed votes."""
        flags = []

        # Calculate missed vote rate
        total_votes = 0
        missed_votes = 0

        for vote_record in votes_data:
            votes = vote_record.get("votes", [])
            total_votes += len(votes)

            for vote in votes:
                if vote.get("vote", "").lower() in ["not-voting", "not voting", "present"]:
                    missed_votes += 1

        if total_votes == 0:
            return flags

        missed_rate = missed_votes / total_votes
        participation_rate = vote_record.get("participationRate", 100 - (missed_rate * 100))

        # Flag if missed rate exceeds threshold
        if missed_rate >= self.THRESHOLDS["missed_votes_rate"]:
            # Check against congress average
            multiplier = missed_rate / self.THRESHOLDS["congress_avg_missed"]

            if multiplier >= 3:
                severity = "critical"
            elif multiplier >= 2:
                severity = "high"
            else:
                severity = "medium"

            flags.append({
                "id": str(uuid.uuid4()),
                "type": "excessive_missed_votes",
                "severity": severity,
                "title": f"Missed {missed_rate * 100:.1f}% of votes",
                "description": f"Missed {missed_votes} of {total_votes} votes ({multiplier:.1f}x the congressional average)",
                "missed_votes": missed_votes,
                "total_votes": total_votes,
                "missed_rate_pct": round(missed_rate * 100, 1),
                "congress_average_pct": round(self.THRESHOLDS["congress_avg_missed"] * 100, 1)
            })

        return flags

    def _detect_transparency_flags(
        self,
        official_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to transparency and accessibility."""
        flags = []

        # Check for town halls (would need actual data - placeholder logic)
        # In production, this would check actual town hall data
        # For now, we'll flag if no public calendar or contact info

        contact_info = official_data.get("personal", {}).get("contactInfo", {})

        if not contact_info.get("email") and not contact_info.get("phone"):
            flags.append({
                "id": str(uuid.uuid4()),
                "type": "low_accessibility",
                "severity": "medium",
                "title": "Limited contact information available",
                "description": "No public email or phone number listed, making it difficult for constituents to reach their representative",
            })

        # Flag if no website
        if not contact_info.get("website"):
            flags.append({
                "id": str(uuid.uuid4()),
                "type": "low_transparency",
                "severity": "low",
                "title": "No public website",
                "description": "No official website listed for constituent information",
            })

        # Placeholder for town hall tracking (would need actual data)
        # flags.append({
        #     "id": str(uuid.uuid4()),
        #     "type": "no_town_halls",
        #     "severity": "high",
        #     "title": "No town halls in 18 months",
        #     "description": "Has not held a public town hall meeting in 18 months",
        #     "months_since_last": 18
        # })

        return flags

    def _detect_stock_conflicts(
        self,
        stocks_data: Dict[str, Any],
        votes_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to stock trading conflicts."""
        flags = []

        trades = stocks_data.get("trades", [])
        conflict_alerts = stocks_data.get("conflictAlerts", [])

        # Flag each conflict alert
        for alert in conflict_alerts[:10]:  # Top 10
            flags.append({
                "id": str(uuid.uuid4()),
                "type": "stock_conflict",
                "severity": "high",
                "title": "Stock trade in conflicted industry",
                "description": alert.get("description", ""),
                "trade_date": alert.get("tradeDate", ""),
                "asset": alert.get("asset", ""),
                "vote_date": alert.get("voteDate", ""),
                "bill": alert.get("bill", "")
            })

        # Flag excessive trading
        if len(trades) > 50:
            flags.append({
                "id": str(uuid.uuid4()),
                "type": "excessive_trading",
                "severity": "medium",
                "title": f"High volume of stock trades ({len(trades)})",
                "description": f"Made {len(trades)} stock trades, raising questions about potential conflicts of interest",
                "trade_count": len(trades)
            })

        return flags

    def _detect_donor_concentration_flags(
        self,
        donations_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect red flags related to donor concentration and corporate influence."""
        flags = []

        summary = donations_data.get("summary", {})
        total_raised = summary.get("totalRaised", 0)
        pac_contributions = summary.get("pacContributions", 0)

        if total_raised == 0:
            return flags

        pac_rate = pac_contributions / total_raised

        # Flag high corporate PAC dependency
        if pac_rate >= self.THRESHOLDS["corporate_pac_threshold"]:
            if pac_rate >= 0.80:
                severity = "critical"
            elif pac_rate >= 0.70:
                severity = "high"
            else:
                severity = "medium"

            flags.append({
                "id": str(uuid.uuid4()),
                "type": "corporate_pac_dependency",
                "severity": severity,
                "title": f"{pac_rate * 100:.1f}% of funding from PACs",
                "description": f"Received {pac_rate * 100:.1f}% of campaign funding from PACs, suggesting heavy corporate influence",
                "pac_amount": pac_contributions,
                "total_raised": total_raised,
                "pac_percentage": round(pac_rate * 100, 1)
            })

        # Check donor concentration
        top_donors = donations_data.get("topDonors", [])
        if len(top_donors) >= 10:
            top_10_total = sum(d.get("amount", 0) for d in top_donors[:10])
            concentration = top_10_total / total_raised if total_raised > 0 else 0

            if concentration >= self.THRESHOLDS["high_donor_concentration"]:
                flags.append({
                    "id": str(uuid.uuid4()),
                    "type": "donor_concentration",
                    "severity": "high" if concentration >= 0.80 else "medium",
                    "title": f"Top 10 donors account for {concentration * 100:.1f}% of funding",
                    "description": f"Campaign funding highly concentrated among small group of donors",
                    "concentration_percentage": round(concentration * 100, 1),
                    "top_10_amount": top_10_total,
                    "total_raised": total_raised
                })

        return flags


# Singleton instance
red_flags_service = RedFlagsService()
