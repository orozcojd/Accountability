"""
Middleware for the FastAPI application.
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
import time
import uuid
from datetime import datetime

from app.core.logging import get_logger
from app.core.config import settings
from app.core.exceptions import AppException, AuthenticationError, NotFoundError

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to each request for tracking."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Log request
        logger.info(
            "request_started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client=request.client.host if request.client else None,
        )

        start_time = time.time()

        response = await call_next(request)

        # Log response
        duration = (time.time() - start_time) * 1000  # Convert to ms
        logger.info(
            "request_completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration, 2),
        )

        response.headers["X-Request-ID"] = request_id
        return response


async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""

    request_id = getattr(request.state, "request_id", "unknown")

    # Handle custom application exceptions
    if isinstance(exc, NotFoundError):
        logger.warning(
            "not_found_error",
            request_id=request_id,
            error=str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "NotFound",
                "message": str(exc),
                "requestId": request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    if isinstance(exc, AuthenticationError):
        logger.warning(
            "authentication_error",
            request_id=request_id,
            error=str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": "Unauthorized",
                "message": str(exc),
                "requestId": request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    if isinstance(exc, AppException):
        logger.error(
            "application_error",
            request_id=request_id,
            error_type=type(exc).__name__,
            error=str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": type(exc).__name__,
                "message": str(exc) if settings.DEBUG else "An error occurred",
                "requestId": request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    # Handle HTTP exceptions
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "requestId": request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    # Handle unexpected exceptions
    logger.error(
        "unhandled_exception",
        request_id=request_id,
        error_type=type(exc).__name__,
        error=str(exc),
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "requestId": request_id,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


def setup_cors(app):
    """Configure CORS middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
