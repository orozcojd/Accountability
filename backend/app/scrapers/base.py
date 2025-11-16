"""
Base scraper class with common functionality.
"""

import httpx
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import ScrapingError, RateLimitError

logger = get_logger(__name__)


class BaseScraper(ABC):
    """Base class for all scrapers."""

    def __init__(self):
        self.timeout = settings.REQUEST_TIMEOUT
        self.max_retries = settings.RETRY_ATTEMPTS

    @abstractmethod
    async def scrape(self, *args, **kwargs) -> Dict[str, Any]:
        """Scrape data from the source."""
        pass

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(min=1, max=10),
        reraise=True,
    )
    async def _make_request(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Make an HTTP request with retry logic.

        Args:
            url: The URL to request
            headers: Optional headers
            params: Optional query parameters

        Returns:
            JSON response data

        Raises:
            ScrapingError: If request fails
            RateLimitError: If rate limit is exceeded
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers, params=params)

                # Check for rate limiting
                if response.status_code == 429:
                    logger.warning("rate_limit_exceeded", url=url)
                    raise RateLimitError("Rate limit exceeded")

                response.raise_for_status()

                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(
                "http_error",
                url=url,
                status_code=e.response.status_code,
                error=str(e),
            )
            raise ScrapingError(f"HTTP error {e.response.status_code}: {url}") from e

        except httpx.RequestError as e:
            logger.error("request_error", url=url, error=str(e))
            raise ScrapingError(f"Request failed: {url}") from e

        except Exception as e:
            logger.error("unexpected_scraping_error", url=url, error=str(e))
            raise ScrapingError(f"Unexpected error: {url}") from e

    def _normalize_party(self, party: str) -> str:
        """Normalize party affiliation."""
        party = party.upper()
        if party in ["D", "DEM", "DEMOCRAT", "DEMOCRATIC"]:
            return "Democratic"
        elif party in ["R", "REP", "REPUBLICAN"]:
            return "Republican"
        elif party in ["I", "IND", "INDEPENDENT"]:
            return "Independent"
        return party

    def _safe_get(self, data: Dict, *keys, default=None):
        """Safely get nested dictionary values."""
        for key in keys:
            if isinstance(data, dict):
                data = data.get(key, default)
            else:
                return default
        return data
