"""
Pydantic models for official data structures.
"""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime, date


class ContactInfo(BaseModel):
    """Contact information for an official."""
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[HttpUrl] = None


class PersonalInfo(BaseModel):
    """Personal information about an official."""
    name: str
    party: str
    state: str
    district: Optional[str] = None
    photoUrl: Optional[str] = None
    contactInfo: Optional[ContactInfo] = None


class ElectionResult(BaseModel):
    """Results from a previous election."""
    year: int
    votePercent: float
    opponent: Optional[str] = None


class ReElectionInfo(BaseModel):
    """Re-election information."""
    nextElection: Optional[date] = None
    termEnd: Optional[date] = None
    previousResults: List[ElectionResult] = []


class Promise(BaseModel):
    """A campaign promise."""
    id: str
    text: str
    source: str
    category: str
    aiGenerated: bool = False


class PromisesData(BaseModel):
    """Collection of promises with summary."""
    lastUpdated: datetime
    items: List[Promise] = []
    aiSummary: Optional[str] = None


class Metadata(BaseModel):
    """Metadata for an official's data."""
    createdAt: datetime
    lastScraped: datetime
    dataVersion: str = "1.0.0"


class Official(BaseModel):
    """Complete official profile."""
    id: str
    type: str  # "representative" or "senator"
    personal: PersonalInfo
    reElection: Optional[ReElectionInfo] = None
    promises: Optional[PromisesData] = None
    metadata: Metadata
