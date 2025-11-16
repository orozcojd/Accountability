"""
Pydantic models for background jobs.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class JobProgress(BaseModel):
    """Progress tracking for a job."""
    total: int
    completed: int
    failed: int


class JobError(BaseModel):
    """Error that occurred during job execution."""
    officialId: Optional[str] = None
    error: str
    timestamp: datetime = datetime.utcnow()


class JobResult(BaseModel):
    """Result summary for a completed job."""
    officialsUpdated: int = 0
    summariesGenerated: int = 0
    isrTriggered: bool = False
    errors: List[JobError] = []


class Job(BaseModel):
    """Background job for scraping and updating data."""
    id: str
    type: str  # "update-all", "scrape-official", "summarize"
    status: str  # "pending", "running", "completed", "failed"
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    progress: Optional[JobProgress] = None
    errors: List[JobError] = []
    result: Optional[JobResult] = None
    metadata: Optional[Dict[str, Any]] = None
