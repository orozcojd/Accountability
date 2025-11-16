"""
AI service for generating neutral summaries using Claude or OpenAI.
"""

from typing import Dict, Any, List, Optional
import anthropic
import openai

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import AIError

logger = get_logger(__name__)


class AIService:
    """Service for AI-powered summarization."""

    NEUTRAL_SYSTEM_PROMPT = """You are a neutral, nonpartisan political analyst creating summaries for the Accountability Platform.

Your summaries must be:
1. Completely neutral and factual - no partisan language or judgment
2. Cite-based - only include information that can be verified
3. Concise - 2-3 sentences maximum
4. Objective - use passive voice and avoid emotional language
5. Balanced - present all perspectives equally

Never use words like: radical, extreme, moderate, good, bad, excellent, terrible, or any subjective adjectives.
Never imply judgment or opinion.
Focus on actions, votes, and stated positions only."""

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        if self.provider == "anthropic":
            self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = settings.AI_MODEL
        elif self.provider == "openai":
            openai.api_key = settings.OPENAI_API_KEY
            self.model = settings.AI_MODEL
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}")

    async def summarize_promises(self, promises_text: List[str], official_name: str) -> str:
        """
        Generate a neutral summary of campaign promises.

        Args:
            promises_text: List of promise texts
            official_name: Name of the official

        Returns:
            Neutral summary string
        """
        user_prompt = f"""Summarize the following campaign promises from {official_name} in 2-3 neutral sentences.
Focus on main policy areas without judgment.

Promises:
{chr(10).join(f'- {p}' for p in promises_text[:20])}

Summary:"""

        return await self._generate_summary(user_prompt)

    async def summarize_voting_record(
        self,
        votes: List[Dict[str, Any]],
        official_name: str,
        participation_rate: float,
    ) -> str:
        """
        Generate a neutral summary of voting record.

        Args:
            votes: List of vote dictionaries
            official_name: Name of the official
            participation_rate: Voting participation percentage

        Returns:
            Neutral summary string
        """
        vote_summary = []
        for vote in votes[:15]:
            vote_summary.append(
                f"{vote['date']}: {vote['vote'].upper()} on {vote['billNumber']} - {vote['title']}"
            )

        user_prompt = f"""Summarize {official_name}'s voting record in 2-3 neutral sentences.
Participation rate: {participation_rate}%

Recent votes:
{chr(10).join(vote_summary)}

Summary (focus on participation and key issue areas, not specific positions):"""

        return await self._generate_summary(user_prompt)

    async def summarize_donations(
        self,
        donation_data: Dict[str, Any],
        official_name: str,
    ) -> str:
        """
        Generate a neutral summary of campaign finance data.

        Args:
            donation_data: Campaign finance data dictionary
            official_name: Name of the official

        Returns:
            Neutral summary string
        """
        summary = donation_data.get("summary", {})
        industries = donation_data.get("topIndustries", [])

        user_prompt = f"""Summarize {official_name}'s campaign finance in 2-3 neutral sentences.

Total raised: ${summary.get('totalRaised', 0):,.0f}
Individual contributions: ${summary.get('individualContributions', 0):,.0f}
PAC contributions: ${summary.get('pacContributions', 0):,.0f}

Top industries:
{chr(10).join(f"- {ind['industry']}: ${ind['amount']:,.0f}" for ind in industries[:5])}

Summary (state facts only, no judgment):"""

        return await self._generate_summary(user_prompt)

    async def summarize_stock_trades(
        self,
        trades: List[Dict[str, Any]],
        official_name: str,
    ) -> str:
        """
        Generate a neutral summary of stock trading activity.

        Args:
            trades: List of stock trade dictionaries
            official_name: Name of the official

        Returns:
            Neutral summary string
        """
        if not trades:
            return f"{official_name} has not disclosed any stock trades in this period."

        trade_summary = []
        for trade in trades[:10]:
            trade_summary.append(
                f"{trade['date']}: {trade['transactionType'].upper()} {trade['assetName']} ({trade['amount']})"
            )

        user_prompt = f"""Summarize {official_name}'s stock trading activity in 2-3 neutral sentences.

Total trades: {len(trades)}

Recent trades:
{chr(10).join(trade_summary)}

Summary (facts only, mention disclosure compliance):"""

        return await self._generate_summary(user_prompt)

    async def extract_promises_from_text(self, campaign_text: List[str]) -> List[Dict[str, str]]:
        """
        Extract specific promises from campaign website text.

        Args:
            campaign_text: List of text snippets from campaign website

        Returns:
            List of extracted promises with categories
        """
        user_prompt = f"""Extract specific policy promises from the following campaign text.
For each promise, provide:
1. A concise statement (1 sentence)
2. A category (healthcare, economy, education, immigration, environment, etc.)

Campaign text:
{chr(10).join(campaign_text[:30])}

Return format:
[category]: [promise statement]

Extracted promises:"""

        try:
            if self.provider == "anthropic":
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=1024,
                    temperature=0.3,
                    system=self.NEUTRAL_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                content = response.content[0].text

            else:  # openai
                response = await openai.ChatCompletion.acreate(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": self.NEUTRAL_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=1024,
                    temperature=0.3,
                )
                content = response.choices[0].message.content

            # Parse the response into structured promises
            promises = []
            for line in content.strip().split("\n"):
                if ":" in line:
                    category, text = line.split(":", 1)
                    promises.append({
                        "category": category.strip().lower(),
                        "text": text.strip(),
                    })

            logger.info("extracted_promises", count=len(promises))
            return promises

        except Exception as e:
            logger.error("promise_extraction_error", error=str(e))
            raise AIError(f"Failed to extract promises: {str(e)}") from e

    async def _generate_summary(self, user_prompt: str) -> str:
        """
        Generate a summary using the configured AI provider.

        Args:
            user_prompt: The prompt for the AI

        Returns:
            Generated summary text

        Raises:
            AIError: If AI generation fails
        """
        try:
            if self.provider == "anthropic":
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=500,
                    temperature=0.3,
                    system=self.NEUTRAL_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}],
                )

                summary = response.content[0].text.strip()

            else:  # openai
                response = await openai.ChatCompletion.acreate(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": self.NEUTRAL_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=500,
                    temperature=0.3,
                )

                summary = response.choices[0].message.content.strip()

            logger.info("summary_generated", provider=self.provider, length=len(summary))
            return summary

        except Exception as e:
            logger.error("ai_summary_error", provider=self.provider, error=str(e))
            raise AIError(f"Failed to generate summary: {str(e)}") from e


# Singleton instance
ai_service = AIService()
