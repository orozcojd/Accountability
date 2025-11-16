"""
Email service for sending magic links and notifications.
"""

from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class EmailService:
    """Email service using SendGrid."""

    def __init__(self):
        self.from_email = settings.FROM_EMAIL
        self.sg = None
        if settings.SENDGRID_API_KEY:
            self.sg = SendGridAPIClient(settings.SENDGRID_API_KEY)

    async def send_magic_link(self, to_email: str, magic_link: str) -> bool:
        """
        Send a magic link email for passwordless login.

        Args:
            to_email: Recipient email address
            magic_link: The magic link URL

        Returns:
            True if sent successfully
        """
        if not self.sg:
            logger.warning("sendgrid_not_configured", to_email=to_email)
            logger.info("magic_link_debug", link=magic_link)
            return False

        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject="Your Accountability Platform Login Link",
                html_content=f"""
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2>Your Login Link</h2>
                        <p>Click the link below to access the Accountability Platform admin dashboard:</p>
                        <p>
                            <a href="{magic_link}"
                               style="background-color: #0D7377; color: white; padding: 12px 24px;
                                      text-decoration: none; border-radius: 4px; display: inline-block;">
                                Access Admin Dashboard
                            </a>
                        </p>
                        <p>This link will expire in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
                        <p style="font-size: 12px; color: #666;">
                            This is an automated message from the Accountability Platform.
                        </p>
                    </body>
                </html>
                """,
            )

            response = self.sg.send(message)

            logger.info(
                "magic_link_sent",
                to_email=to_email,
                status_code=response.status_code,
            )

            return response.status_code in [200, 201, 202]

        except Exception as e:
            logger.error("email_send_error", to_email=to_email, error=str(e))
            return False


# Singleton instance
email_service = EmailService()
