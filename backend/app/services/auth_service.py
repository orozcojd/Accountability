"""
Authentication service for magic links and session management.
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import AuthenticationError
from app.services.s3_client import s3_client
from app.services.email_service import email_service
from app.models.auth import Session

logger = get_logger(__name__)


class AuthService:
    """Handles authentication and session management."""

    def __init__(self):
        self.jwt_secret = settings.JWT_SECRET
        self.session_secret = settings.SESSION_SECRET
        self.admin_email = settings.ADMIN_EMAIL.lower()

    def _is_admin_email(self, email: str) -> bool:
        """Check if email is authorized as admin."""
        return email.lower() == self.admin_email

    async def request_magic_link(self, email: str) -> tuple[bool, str]:
        """
        Generate and send a magic link.

        Args:
            email: User's email address

        Returns:
            Tuple of (success, message)
        """
        # Validate admin email
        if not self._is_admin_email(email):
            logger.warning("unauthorized_magic_link_request", email=email)
            # Don't reveal if email is unauthorized (security best practice)
            return True, "If this email is authorized, a login link has been sent."

        try:
            # Generate JWT token
            expiry = datetime.utcnow() + timedelta(minutes=settings.MAGIC_LINK_EXPIRY_MINUTES)
            token_data = {
                "email": email,
                "exp": expiry,
                "iat": datetime.utcnow(),
                "type": "magic_link",
            }

            token = jwt.encode(token_data, self.jwt_secret, algorithm="HS256")

            # Store token hash in S3 (to prevent reuse)
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            await s3_client.put_json(
                f"auth/tokens/{token_hash}.json",
                {
                    "email": email,
                    "createdAt": datetime.utcnow().isoformat(),
                    "expiresAt": expiry.isoformat(),
                    "used": False,
                },
            )

            # Generate magic link URL
            magic_link = f"{settings.FRONTEND_URL}/admin/auth?token={token}"

            # Send email
            sent = await email_service.send_magic_link(email, magic_link)

            if sent:
                logger.info("magic_link_sent", email=email)
                return True, "Check your email for a login link."
            else:
                logger.warning("magic_link_email_failed", email=email)
                # In dev mode without SendGrid, log the link
                if not settings.SENDGRID_API_KEY:
                    logger.info("magic_link_url", url=magic_link)
                    return True, f"Magic link (dev): {magic_link}"
                return False, "Failed to send email. Please try again."

        except Exception as e:
            logger.error("magic_link_error", email=email, error=str(e))
            return False, "An error occurred. Please try again."

    async def verify_token(self, token: str) -> Session:
        """
        Verify a magic link token and create a session.

        Args:
            token: The JWT token from the magic link

        Returns:
            Session object

        Raises:
            AuthenticationError: If token is invalid or expired
        """
        try:
            # Decode JWT
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])

            if payload.get("type") != "magic_link":
                raise AuthenticationError("Invalid token type")

            email = payload.get("email")
            if not email or not self._is_admin_email(email):
                raise AuthenticationError("Unauthorized")

            # Check if token has been used
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            token_data = await s3_client.get_json(f"auth/tokens/{token_hash}.json")

            if not token_data:
                raise AuthenticationError("Invalid token")

            if token_data.get("used"):
                raise AuthenticationError("Token already used")

            # Mark token as used
            token_data["used"] = True
            token_data["usedAt"] = datetime.utcnow().isoformat()
            await s3_client.put_json(f"auth/tokens/{token_hash}.json", token_data)

            # Create session
            session_token = secrets.token_urlsafe(32)
            session_expiry = datetime.utcnow() + timedelta(days=settings.SESSION_EXPIRY_DAYS)

            session = Session(
                userId="admin",
                email=email,
                createdAt=datetime.utcnow(),
                expiresAt=session_expiry,
            )

            # Store session in S3
            await s3_client.put_json(
                f"auth/sessions/{session_token}.json",
                session.model_dump(mode="json"),
            )

            logger.info("session_created", email=email, session_token=session_token[:8] + "...")

            # Return session with token
            return session, session_token

        except JWTError as e:
            logger.warning("jwt_decode_error", error=str(e))
            raise AuthenticationError("Invalid or expired token") from e

        except Exception as e:
            logger.error("token_verify_error", error=str(e))
            raise AuthenticationError("Token verification failed") from e

    async def verify_session(self, session_token: str) -> Session:
        """
        Verify a session token.

        Args:
            session_token: The session token

        Returns:
            Session object

        Raises:
            AuthenticationError: If session is invalid or expired
        """
        try:
            session_data = await s3_client.get_json(f"auth/sessions/{session_token}.json")

            if not session_data:
                raise AuthenticationError("Invalid session")

            session = Session(**session_data)

            # Check expiry
            if datetime.utcnow() > session.expiresAt:
                # Delete expired session
                await s3_client.delete(f"auth/sessions/{session_token}.json")
                raise AuthenticationError("Session expired")

            return session

        except AuthenticationError:
            raise
        except Exception as e:
            logger.error("session_verify_error", error=str(e))
            raise AuthenticationError("Session verification failed") from e

    async def logout(self, session_token: str) -> bool:
        """
        Invalidate a session.

        Args:
            session_token: The session token to invalidate

        Returns:
            True if successful
        """
        try:
            await s3_client.delete(f"auth/sessions/{session_token}.json")
            logger.info("session_invalidated", session_token=session_token[:8] + "...")
            return True
        except Exception as e:
            logger.error("logout_error", error=str(e))
            return False


# Singleton instance
auth_service = AuthService()
