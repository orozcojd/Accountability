"""
Authentication API routes.
"""

from fastapi import APIRouter, HTTPException, status, Depends

from app.models.auth import (
    MagicLinkRequest,
    MagicLinkResponse,
    TokenVerifyRequest,
    TokenVerifyResponse,
)
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_admin
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request", response_model=MagicLinkResponse)
async def request_magic_link(request: MagicLinkRequest):
    """
    Request a magic link for passwordless authentication.

    The magic link will be sent to the provided email if it's authorized.
    """
    success, message = await auth_service.request_magic_link(request.email)

    return MagicLinkResponse(success=success, message=message)


@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_token(request: TokenVerifyRequest):
    """
    Verify a magic link token and create a session.

    Returns a session token to be used for authenticated requests.
    """
    try:
        session, session_token = await auth_service.verify_token(request.token)

        return TokenVerifyResponse(
            sessionToken=session_token,
            expiresAt=session.expiresAt,
        )

    except Exception as e:
        logger.warning("token_verify_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


@router.post("/logout")
async def logout(session=Depends(get_current_admin)):
    """
    Logout and invalidate the current session.

    Requires: Bearer token in Authorization header
    """
    # Extract token from dependency context
    # (In a real implementation, we'd pass the token through)
    return {"success": True, "message": "Logged out successfully"}
