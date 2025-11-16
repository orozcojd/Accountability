"""
Web scraper for campaign websites to extract promises.
"""

from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup

from app.scrapers.base import BaseScraper
from app.core.logging import get_logger
from app.core.exceptions import ScrapingError

logger = get_logger(__name__)


class CampaignWebsiteScraper(BaseScraper):
    """Scraper for campaign websites."""

    async def scrape_issues_page(self, url: str) -> List[str]:
        """
        Scrape campaign promises from an issues/positions page.

        Args:
            url: URL of the campaign website issues page

        Returns:
            List of extracted text snippets (to be processed by AI)
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            # Remove script, style, and navigation elements
            for element in soup(["script", "style", "nav", "header", "footer"]):
                element.decompose()

            # Extract text from common content containers
            content_selectors = [
                "main",
                "article",
                ".content",
                "#content",
                ".issues",
                ".positions",
                ".policy",
            ]

            promises_text = []

            for selector in content_selectors:
                elements = soup.select(selector)
                for element in elements:
                    # Extract headings and paragraphs
                    for tag in element.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
                        text = tag.get_text(strip=True)
                        if len(text) > 20:  # Filter out very short snippets
                            promises_text.append(text)

            # If no content found with selectors, get all paragraphs
            if not promises_text:
                for p in soup.find_all("p"):
                    text = p.get_text(strip=True)
                    if len(text) > 20:
                        promises_text.append(text)

            logger.info("scraped_campaign_website", url=url, snippets=len(promises_text))

            return promises_text[:50]  # Limit to avoid overwhelming AI

        except httpx.HTTPError as e:
            logger.error("campaign_scrape_http_error", url=url, error=str(e))
            raise ScrapingError(f"Failed to scrape campaign website: {url}") from e

        except Exception as e:
            logger.error("campaign_scrape_error", url=url, error=str(e))
            raise ScrapingError(f"Error scraping campaign website: {url}") from e

    async def find_issues_page_url(self, base_url: str) -> Optional[str]:
        """
        Try to find the issues/positions page from the homepage.

        Args:
            base_url: Campaign website homepage URL

        Returns:
            URL of issues page if found
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(base_url)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            # Look for common issues page link text
            keywords = [
                "issues",
                "positions",
                "policy",
                "priorities",
                "platform",
                "agenda",
                "on the issues",
            ]

            for link in soup.find_all("a", href=True):
                link_text = link.get_text(strip=True).lower()
                href = link["href"]

                for keyword in keywords:
                    if keyword in link_text or keyword in href.lower():
                        # Convert relative URLs to absolute
                        if href.startswith("/"):
                            from urllib.parse import urljoin
                            href = urljoin(base_url, href)
                        elif not href.startswith("http"):
                            continue

                        logger.info("found_issues_page", base_url=base_url, issues_url=href)
                        return href

            logger.warning("no_issues_page_found", base_url=base_url)
            return None

        except Exception as e:
            logger.error("issues_page_search_error", base_url=base_url, error=str(e))
            return None
