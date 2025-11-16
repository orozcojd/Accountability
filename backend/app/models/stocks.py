"""
Pydantic models for stock trading data.
"""

from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime, date


class StockTrade(BaseModel):
    """A single stock trade."""
    id: str
    date: date
    ticker: Optional[str] = None
    assetName: str
    transactionType: str  # "purchase" or "sale"
    amount: str  # e.g., "$15,001 - $50,000"
    filingDate: date
    reportUrl: Optional[HttpUrl] = None


class ConflictAlert(BaseModel):
    """Potential conflict of interest alert."""
    tradeId: str
    reason: str
    severity: str  # "low", "medium", "high"


class StockData(BaseModel):
    """Stock trading data for an official."""
    officialId: str
    year: int
    lastUpdated: datetime
    trades: List[StockTrade] = []
    aiSummary: Optional[str] = None
    conflictAlerts: List[ConflictAlert] = []
    source: str = "fec"
