"""
ISR revalidation service for triggering Next.js cache invalidation.
"""

from typing import List, Dict
import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ISRService:
    """Service for triggering Next.js ISR revalidation."""

    def __init__(self):
        self.revalidate_url = f"{settings.VERCEL_DEPLOYMENT_URL}/api/revalidate"
        self.secret = settings.REVALIDATE_SECRET

    async def revalidate_paths(self, paths: List[str]) -> Dict[str, bool]:
        """
        Trigger ISR revalidation for multiple paths.

        Args:
            paths: List of paths to revalidate (e.g., ["/officials/ca-12", "/"])

        Returns:
            Dictionary mapping paths to success status
        """
        results = {}

        async with httpx.AsyncClient(timeout=10.0) as client:
            for path in paths:
                try:
                    response = await client.post(
                        self.revalidate_url,
                        json={"path": path},
                        headers={"Authorization": f"Bearer {self.secret}"},
                    )

                    success = response.status_code == 200
                    results[path] = success

                    if success:
                        logger.info("isr_revalidate_success", path=path)
                    else:
                        logger.warning(
                            "isr_revalidate_failed",
                            path=path,
                            status=response.status_code,
                        )

                except Exception as e:
                    logger.error("isr_revalidate_error", path=path, error=str(e))
                    results[path] = False

        return results

    async def revalidate_official(self, official_id: str, state: str) -> bool:
        """
        Revalidate pages for a specific official.

        Args:
            official_id: Official ID (e.g., "ca-12")
            state: State abbreviation (e.g., "ca")

        Returns:
            True if all revalidations succeeded
        """
        paths = [
            f"/officials/{official_id}",
            f"/officials/{state}",
            "/",  # Homepage (recent updates)
        ]

        results = await self.revalidate_paths(paths)
        success = all(results.values())

        logger.info(
            "official_revalidated",
            official_id=official_id,
            success=success,
            paths=paths,
        )

        return success


# Singleton instance
isr_service = ISRService()
