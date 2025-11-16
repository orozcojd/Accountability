"""
Pydantic models for campaign finance data.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ContributionSummary(BaseModel):
    """Summary of campaign contributions."""
    totalRaised: float
    individualContributions: float
    pacContributions: float
    selfFunding: Optional[float] = 0.0


class Donor(BaseModel):
    """Top donor information."""
    name: str
    amount: float
    type: str  # "PAC", "Individual", etc.
    industry: Optional[str] = None
    industry_category: Optional[str] = None  # Categorized industry for analysis
    donation_date: Optional[str] = None  # Date of donation if available


class Industry(BaseModel):
    """Industry contribution summary."""
    industry: str
    amount: float
    category: Optional[str] = None  # Standardized category


class DonationData(BaseModel):
    """Campaign finance data for an official."""
    officialId: str
    cycle: str  # e.g., "2024"
    lastUpdated: datetime
    summary: ContributionSummary
    topDonors: List[Donor] = []
    topIndustries: List[Industry] = []
    aiSummary: Optional[str] = None
    source: str = "opensecrets"
