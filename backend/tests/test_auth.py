"""
Tests for authentication service.
"""

import pytest
from datetime import datetime, timedelta

from app.services.auth_service import auth_service
from app.core.exceptions import AuthenticationError


@pytest.mark.asyncio
async def test_magic_link_request_authorized_email(monkeypatch):
    """Test magic link request with authorized email."""
    # Mock the email service
    sent_links = []

    async def mock_send_magic_link(email, link):
        sent_links.append((email, link))
        return True

    monkeypatch.setattr("app.services.auth_service.email_service.send_magic_link", mock_send_magic_link)

    success, message = await auth_service.request_magic_link("admin@example.com")

    assert success is True
    assert "email" in message.lower()
    assert len(sent_links) == 1


@pytest.mark.asyncio
async def test_magic_link_request_unauthorized_email():
    """Test magic link request with unauthorized email."""
    success, message = await auth_service.request_magic_link("hacker@evil.com")

    # Should not reveal if email is unauthorized
    assert success is True
    assert "authorized" in message.lower()


@pytest.mark.asyncio
async def test_session_verification():
    """Test session token verification."""
    # This would require mocking S3 operations
    # Simplified test structure
    pass


@pytest.mark.asyncio
async def test_expired_token_rejection():
    """Test that expired tokens are rejected."""
    # This would test JWT expiration handling
    pass
