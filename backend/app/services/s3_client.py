"""
S3 client service for reading and writing JSON files.
"""

import json
import hashlib
from typing import Any, Optional, Dict
from datetime import datetime
import aioboto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import S3Error, NotFoundError

logger = get_logger(__name__)


class S3Client:
    """Async S3 client for JSON file operations."""

    def __init__(self):
        self.bucket = settings.S3_BUCKET
        self.session = aioboto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )

    async def get_json(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Read a JSON file from S3.

        Args:
            key: S3 object key (path)

        Returns:
            Parsed JSON data or None if not found

        Raises:
            S3Error: If S3 operation fails
        """
        try:
            async with self.session.client("s3") as s3:
                response = await s3.get_object(Bucket=self.bucket, Key=key)
                content = await response["Body"].read()
                data = json.loads(content.decode("utf-8"))

                logger.debug("s3_read_success", key=key, size=len(content))
                return data

        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "NoSuchKey":
                logger.debug("s3_key_not_found", key=key)
                return None
            logger.error("s3_read_error", key=key, error=str(e))
            raise S3Error(f"Failed to read from S3: {key}") from e

        except Exception as e:
            logger.error("s3_unexpected_error", key=key, error=str(e))
            raise S3Error(f"Unexpected error reading from S3: {key}") from e

    async def put_json(
        self,
        key: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, str]] = None,
        cache_control: str = "max-age=3600",
    ) -> bool:
        """
        Write a JSON file to S3.

        Args:
            key: S3 object key (path)
            data: Data to write (will be JSON serialized)
            metadata: Optional metadata to attach
            cache_control: Cache-Control header value

        Returns:
            True if successful

        Raises:
            S3Error: If S3 operation fails
        """
        try:
            async with self.session.client("s3") as s3:
                json_data = json.dumps(data, indent=2, default=str)
                json_bytes = json_data.encode("utf-8")

                put_args = {
                    "Bucket": self.bucket,
                    "Key": key,
                    "Body": json_bytes,
                    "ContentType": "application/json",
                    "CacheControl": cache_control,
                }

                if metadata:
                    put_args["Metadata"] = metadata

                await s3.put_object(**put_args)

                logger.info("s3_write_success", key=key, size=len(json_bytes))
                return True

        except Exception as e:
            logger.error("s3_write_error", key=key, error=str(e))
            raise S3Error(f"Failed to write to S3: {key}") from e

    async def delete(self, key: str) -> bool:
        """
        Delete an object from S3.

        Args:
            key: S3 object key (path)

        Returns:
            True if successful
        """
        try:
            async with self.session.client("s3") as s3:
                await s3.delete_object(Bucket=self.bucket, Key=key)
                logger.info("s3_delete_success", key=key)
                return True

        except Exception as e:
            logger.error("s3_delete_error", key=key, error=str(e))
            raise S3Error(f"Failed to delete from S3: {key}") from e

    async def exists(self, key: str) -> bool:
        """Check if an object exists in S3."""
        try:
            async with self.session.client("s3") as s3:
                await s3.head_object(Bucket=self.bucket, Key=key)
                return True
        except ClientError:
            return False

    async def list_keys(self, prefix: str) -> list[str]:
        """List all keys with the given prefix."""
        try:
            async with self.session.client("s3") as s3:
                paginator = s3.get_paginator("list_objects_v2")
                keys = []

                async for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
                    if "Contents" in page:
                        keys.extend([obj["Key"] for obj in page["Contents"]])

                logger.debug("s3_list_success", prefix=prefix, count=len(keys))
                return keys

        except Exception as e:
            logger.error("s3_list_error", prefix=prefix, error=str(e))
            raise S3Error(f"Failed to list S3 keys: {prefix}") from e

    def compute_hash(self, data: Dict[str, Any]) -> str:
        """Compute SHA256 hash of JSON data for change detection."""
        json_str = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(json_str.encode()).hexdigest()

    async def get_metadata(self, official_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for an official (includes data hashes)."""
        return await self.get_json(f"metadata/{official_id}.json")

    async def save_metadata(self, official_id: str, metadata: Dict[str, Any]) -> bool:
        """Save metadata for an official."""
        metadata["lastUpdated"] = datetime.utcnow().isoformat()
        return await self.put_json(f"metadata/{official_id}.json", metadata)


# Singleton instance
s3_client = S3Client()
