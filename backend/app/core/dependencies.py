"""
FastAPI dependencies for authentication and common operations.
"""

from fastapi import Header, HTTPException, status
from typing import Optional

from app.services.auth_service import auth_service
from app.models.auth import Session
from app.core.logging import get_logger

logger = get_logger(__name__)


async def get_current_admin(authorization: Optional[str] = Header(None)) -> Session:
    """
    Dependency to verify admin authentication.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        Session object for authenticated admin

    Raises:
        HTTPException: If unauthorized
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = authorization.replace("Bearer ", "")

    try:
        session = await auth_service.verify_session(token)
        return session

    except Exception as e:
        logger.warning("auth_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
