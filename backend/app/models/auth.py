"""
Pydantic models for authentication.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class MagicLinkRequest(BaseModel):
    """Request for a magic link."""
    email: EmailStr


class MagicLinkResponse(BaseModel):
    """Response after requesting a magic link."""
    success: bool
    message: str


class TokenVerifyRequest(BaseModel):
    """Request to verify a magic link token."""
    token: str


class TokenVerifyResponse(BaseModel):
    """Response after verifying a token."""
    sessionToken: str
    expiresAt: datetime


class Session(BaseModel):
    """User session data."""
    userId: str
    email: str
    createdAt: datetime
    expiresAt: datetime
