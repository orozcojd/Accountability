"""
Public API routes for officials data.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.services.s3_client import s3_client
from app.core.logging import get_logger
from app.core.exceptions import NotFoundError

logger = get_logger(__name__)

router = APIRouter(prefix="/officials", tags=["Officials"])


@router.get("")
async def list_officials(
    state: Optional[str] = Query(None, description="Filter by state (e.g., 'ca')"),
    chamber: Optional[str] = Query(None, description="Filter by chamber ('house' or 'senate')"),
    party: Optional[str] = Query(None, description="Filter by party"),
    q: Optional[str] = Query(None, description="Search query"),
):
    """
    List all officials with optional filters.

    Returns a list of officials that can be filtered by state, chamber, party, or search query.
    """
    # Get all officials from S3
    # In a production system, we'd maintain an index file
    officials = []

    # For now, return a simple structure
    # TODO: Implement actual official listing from S3
    logger.info("list_officials", filters={"state": state, "chamber": chamber, "party": party, "q": q})

    return {
        "officials": officials,
        "total": len(officials),
        "filters": {"state": state, "chamber": chamber, "party": party},
    }


@router.get("/{official_id}")
async def get_official(official_id: str):
    """
    Get a specific official's profile.

    Args:
        official_id: Official ID (e.g., "ca-12")

    Returns:
        Complete official profile
    """
    # Parse official_id to get state and district
    parts = official_id.split("-")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid official ID format")

    state = parts[0].lower()
    district_or_sen = parts[1]

    # Construct S3 key
    if district_or_sen.startswith("sen"):
        filename = f"senator_{district_or_sen[-1]}.json" if len(district_or_sen) > 3 else "senator_1.json"
    else:
        filename = f"district_{district_or_sen}.json"

    key = f"officials/{state}/{filename}"

    official_data = await s3_client.get_json(key)

    if not official_data:
        raise HTTPException(
            status_code=404,
            detail=f"Official with ID '{official_id}' not found",
        )

    return official_data


@router.get("/{official_id}/votes")
async def get_official_votes(
    official_id: str,
    year: Optional[int] = Query(None, description="Filter by year"),
):
    """
    Get voting records for an official.

    Args:
        official_id: Official ID
        year: Optional year filter

    Returns:
        Voting records
    """
    from datetime import datetime

    if not year:
        year = datetime.utcnow().year

    key = f"votes/{official_id}/{year}.json"
    votes_data = await s3_client.get_json(key)

    if not votes_data:
        # Return empty structure if no data
        return {
            "officialId": official_id,
            "year": year,
            "votes": [],
            "aiSummary": None,
        }

    return votes_data


@router.get("/{official_id}/donations")
async def get_official_donations(
    official_id: str,
    cycle: Optional[str] = Query(None, description="Election cycle (e.g., '2024')"),
):
    """
    Get campaign finance data for an official.

    Args:
        official_id: Official ID
        cycle: Optional election cycle

    Returns:
        Campaign finance data
    """
    if not cycle:
        cycle = "2024"

    key = f"donations/{official_id}/{cycle}.json"
    donations_data = await s3_client.get_json(key)

    if not donations_data:
        return {
            "officialId": official_id,
            "cycle": cycle,
            "summary": {
                "totalRaised": 0,
                "individualContributions": 0,
                "pacContributions": 0,
                "selfFunding": 0,
            },
            "topDonors": [],
            "topIndustries": [],
        }

    return donations_data


@router.get("/{official_id}/stocks")
async def get_official_stocks(
    official_id: str,
    year: Optional[int] = Query(None, description="Filter by year"),
):
    """
    Get stock trading data for an official.

    Args:
        official_id: Official ID
        year: Optional year filter

    Returns:
        Stock trading data
    """
    from datetime import datetime

    if not year:
        year = datetime.utcnow().year

    key = f"stocks/{official_id}/{year}.json"
    stocks_data = await s3_client.get_json(key)

    if not stocks_data:
        return {
            "officialId": official_id,
            "year": year,
            "trades": [],
            "aiSummary": None,
            "conflictAlerts": [],
        }

    return stocks_data


@router.get("/{official_id}/promises")
async def get_official_promises(official_id: str):
    """
    Get campaign promises for an official.

    Args:
        official_id: Official ID

    Returns:
        Campaign promises data
    """
    # Promises are part of the main official data
    official_data = await get_official(official_id)

    return official_data.get("promises", {
        "lastUpdated": None,
        "items": [],
        "aiSummary": None,
    })
