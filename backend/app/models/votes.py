"""
Pydantic models for voting records.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date


class Vote(BaseModel):
    """A single vote record."""
    id: str
    billNumber: str
    title: str
    date: date
    vote: str  # "yes", "no", "not-voting", "present"
    billSummary: Optional[str] = None
    source: str = "propublica"
    categories: List[str] = []  # Bill categories (healthcare, economy, etc.)
    industry_impact: List[str] = []  # Industries impacted by this bill
    district_impact: Optional[str] = None  # Impact on representative's district


class VotingRecord(BaseModel):
    """Voting record for an official for a specific year."""
    officialId: str
    year: int
    lastUpdated: datetime
    votes: List[Vote] = []
    aiSummary: Optional[str] = None
    participationRate: Optional[float] = None


class VotingStats(BaseModel):
    """Statistics about voting participation."""
    totalVotes: int
    votesCast: int
    participationRate: float
    congressAverage: Optional[float] = None
