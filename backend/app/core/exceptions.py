"""
Custom exceptions for the application.
"""


class AppException(Exception):
    """Base exception for application errors."""
    pass


class ScrapingError(AppException):
    """Failed to scrape data from external source."""
    pass


class AIError(AppException):
    """AI summarization failed."""
    pass


class S3Error(AppException):
    """S3 operation failed."""
    pass


class AuthenticationError(AppException):
    """Authentication failed."""
    pass


class ValidationError(AppException):
    """Data validation failed."""
    pass


class NotFoundError(AppException):
    """Resource not found."""
    pass


class RateLimitError(AppException):
    """Rate limit exceeded for external API."""
    pass
