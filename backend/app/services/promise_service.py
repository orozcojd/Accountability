"""
Service for tracking campaign promises vs. actual voting record.
"Promise Meter" - Track kept vs. broken promises.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.logging import get_logger
from app.services.ai_service import ai_service

logger = get_logger(__name__)


class PromiseService:
    """Service for analyzing promise keeping and detecting contradictions."""

    # Keywords indicating promise/commitment
    PROMISE_INDICATORS = [
        "will", "pledge", "promise", "commit", "plan to", "going to",
        "fight for", "work for", "support", "oppose", "never", "always"
    ]

    def __init__(self):
        pass

    async def analyze_promise_keeping(
        self,
        official_id: str,
        official_name: str,
        promises_data: Dict[str, Any],
        votes_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze how well an official has kept their campaign promises.

        Args:
            official_id: Official ID
            official_name: Official's name
            promises_data: Campaign promises data
            votes_data: Voting record data

        Returns:
            Promise tracking analysis with kept/broken status
        """
        promises = promises_data.get("items", [])

        if not promises:
            return {
                "official_id": official_id,
                "summary": {
                    "total_promises": 0,
                    "kept": 0,
                    "broken": 0,
                    "in_progress": 0,
                    "not_addressed": 0,
                    "promise_keeping_score": 0
                },
                "promises": []
            }

        # Analyze each promise
        analyzed_promises = []
        for promise in promises:
            analysis = await self._analyze_single_promise(
                promise,
                votes_data,
                official_name
            )
            analyzed_promises.append(analysis)

        # Calculate summary statistics
        status_counts = {
            "kept": 0,
            "broken": 0,
            "in_progress": 0,
            "not_addressed": 0
        }

        for promise in analyzed_promises:
            status = promise.get("status", "not_addressed")
            status_counts[status] += 1

        total = len(analyzed_promises)
        promise_keeping_score = (
            (status_counts["kept"] / total * 100) if total > 0 else 0
        )

        return {
            "official_id": official_id,
            "summary": {
                "total_promises": total,
                "kept": status_counts["kept"],
                "broken": status_counts["broken"],
                "in_progress": status_counts["in_progress"],
                "not_addressed": status_counts["not_addressed"],
                "promise_keeping_score": round(promise_keeping_score, 1)
            },
            "promises": sorted(
                analyzed_promises,
                key=lambda x: x.get("times_voted_against", 0),
                reverse=True
            )
        }

    async def _analyze_single_promise(
        self,
        promise: Dict[str, Any],
        votes_data: List[Dict[str, Any]],
        official_name: str
    ) -> Dict[str, Any]:
        """
        Analyze a single promise against voting record.

        Args:
            promise: Promise data
            votes_data: Voting record data
            official_name: Official's name

        Returns:
            Promise analysis with status and evidence
        """
        promise_text = promise.get("text", "")
        promise_category = promise.get("category", "").lower()
        promise_id = promise.get("id", "")

        # Find related votes using AI analysis
        related_votes = await self._find_related_votes(
            promise_text,
            promise_category,
            votes_data
        )

        # Determine if votes support or contradict the promise
        supporting_votes = []
        contradicting_votes = []

        for vote in related_votes:
            # Use AI to determine if vote aligns with promise
            alignment = await self._check_vote_promise_alignment(
                promise_text,
                vote,
                official_name
            )

            if alignment == "supports":
                supporting_votes.append(vote)
            elif alignment == "contradicts":
                contradicting_votes.append(vote)

        # Determine overall status
        status = self._determine_promise_status(
            supporting_votes,
            contradicting_votes,
            promise_text
        )

        # Build evidence list
        evidence = []
        for vote in contradicting_votes[:10]:  # Limit to top 10
            evidence.append({
                "vote_id": vote.get("id", ""),
                "bill_name": vote.get("title", ""),
                "bill_number": vote.get("billNumber", ""),
                "vote": vote.get("vote", ""),
                "date": str(vote.get("date", "")),
                "contradicts_promise": True
            })

        for vote in supporting_votes[:5]:  # Fewer supporting examples
            evidence.append({
                "vote_id": vote.get("id", ""),
                "bill_name": vote.get("title", ""),
                "bill_number": vote.get("billNumber", ""),
                "vote": vote.get("vote", ""),
                "date": str(vote.get("date", "")),
                "contradicts_promise": False
            })

        return {
            "promise_id": promise_id,
            "category": promise_category,
            "promise_text": promise_text,
            "promise_date": promise.get("source", ""),  # Could be improved with actual date
            "source_url": promise.get("source", ""),
            "status": status,
            "evidence": evidence,
            "times_voted_against": len(contradicting_votes),
            "times_voted_for": len(supporting_votes)
        }

    async def _find_related_votes(
        self,
        promise_text: str,
        promise_category: str,
        votes_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Find votes related to a promise using keyword and AI matching.

        Args:
            promise_text: Promise text
            promise_category: Promise category
            votes_data: Voting record data

        Returns:
            List of related votes
        """
        # Extract keywords from promise
        keywords = self._extract_keywords(promise_text, promise_category)

        related_votes = []

        for vote_record in votes_data:
            for vote in vote_record.get("votes", []):
                vote_title = vote.get("title", "").lower()
                vote_summary = vote.get("billSummary", "").lower()

                # Check for keyword matches
                if any(kw in vote_title or kw in vote_summary for kw in keywords):
                    related_votes.append(vote)

        return related_votes

    def _extract_keywords(self, promise_text: str, category: str) -> List[str]:
        """Extract relevant keywords from promise text."""
        # Category-based keywords
        category_keywords = {
            "healthcare": ["healthcare", "health", "medical", "medicare", "medicaid", "insurance", "hospital"],
            "economy": ["economy", "tax", "jobs", "employment", "business", "income"],
            "education": ["education", "school", "student", "college", "teacher"],
            "environment": ["environment", "climate", "clean", "pollution", "renewable", "energy"],
            "immigration": ["immigration", "border", "visa", "citizenship", "refugee"],
            "defense": ["defense", "military", "veteran", "armed forces"],
            "infrastructure": ["infrastructure", "highway", "bridge", "broadband", "transportation"],
            "justice": ["justice", "prison", "police", "crime", "court"],
            "labor": ["labor", "worker", "wage", "union", "employment"],
        }

        keywords = category_keywords.get(category, [])

        # Add specific keywords from promise text
        text_lower = promise_text.lower()
        important_words = []

        # Extract nouns and key phrases (simplified - could use NLP)
        words = text_lower.split()
        for i, word in enumerate(words):
            if len(word) > 4:  # Focus on longer words
                # Skip common words
                if word not in ["about", "would", "should", "their", "there", "where", "these", "those"]:
                    important_words.append(word)

        keywords.extend(important_words[:5])  # Top 5 words

        return keywords

    async def _check_vote_promise_alignment(
        self,
        promise_text: str,
        vote: Dict[str, Any],
        official_name: str
    ) -> str:
        """
        Use AI to determine if a vote aligns with or contradicts a promise.

        Args:
            promise_text: Promise text
            vote: Vote data
            official_name: Official's name

        Returns:
            "supports", "contradicts", or "neutral"
        """
        # Simplified heuristic approach (in production, would use full AI analysis)
        # Check if promise is pro or anti something
        vote_value = vote.get("vote", "").lower()
        bill_title = vote.get("title", "").lower()

        # Detect promise stance
        promise_lower = promise_text.lower()

        # Positive stance indicators
        pro_indicators = ["fight for", "support", "expand", "increase", "protect", "strengthen"]
        anti_indicators = ["fight against", "oppose", "reduce", "cut", "eliminate", "stop"]

        is_pro_promise = any(ind in promise_lower for ind in pro_indicators)
        is_anti_promise = any(ind in promise_lower for ind in anti_indicators)

        # Simple alignment logic
        if is_pro_promise and vote_value == "yes":
            return "supports"
        elif is_pro_promise and vote_value == "no":
            return "contradicts"
        elif is_anti_promise and vote_value == "no":
            return "supports"
        elif is_anti_promise and vote_value == "yes":
            return "contradicts"

        return "neutral"

    def _determine_promise_status(
        self,
        supporting_votes: List[Dict[str, Any]],
        contradicting_votes: List[Dict[str, Any]],
        promise_text: str
    ) -> str:
        """
        Determine overall promise status based on voting evidence.

        Args:
            supporting_votes: Votes supporting the promise
            contradicting_votes: Votes contradicting the promise
            promise_text: Promise text

        Returns:
            "kept", "broken", "in_progress", or "not_addressed"
        """
        total_votes = len(supporting_votes) + len(contradicting_votes)

        if total_votes == 0:
            return "not_addressed"

        contradiction_rate = len(contradicting_votes) / total_votes

        if contradiction_rate >= 0.7:
            return "broken"
        elif contradiction_rate >= 0.4:
            return "in_progress"
        elif len(supporting_votes) >= 3:
            return "kept"
        else:
            return "in_progress"


# Singleton instance
promise_service = PromiseService()
