"""
Public API routes for officials data.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.services.s3_client import s3_client
from app.core.logging import get_logger
from app.core.exceptions import NotFoundError
from app.services.influence_service import influence_service
from app.services.promise_service import promise_service
from app.services.red_flags_service import red_flags_service
from app.services.accountability_score_service import accountability_score_service

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


@router.get("/{official_id}/influence-analysis")
async def get_influence_analysis(official_id: str, cycle: Optional[str] = Query(None)):
    """
    Get influence correlation analysis for an official.
    Tracks correlation between donations and voting patterns.

    Args:
        official_id: Official ID
        cycle: Optional election cycle (defaults to "2024")

    Returns:
        Influence analysis including industry correlations and red flags
    """
    from datetime import datetime

    if not cycle:
        cycle = "2024"

    # Get donations data
    donations_data = await get_official_donations(official_id, cycle)

    # Get voting data (last 2 years)
    current_year = datetime.utcnow().year
    votes_data = []
    for year in [current_year, current_year - 1]:
        year_votes = await get_official_votes(official_id, year)
        votes_data.append(year_votes)

    # Calculate influence score
    analysis = await influence_service.calculate_influence_score(
        official_id,
        donations_data,
        votes_data
    )

    logger.info("influence_analysis", official_id=official_id, score=analysis.get("influence_score"))

    return analysis


@router.get("/{official_id}/promise-tracker")
async def get_promise_tracker(official_id: str):
    """
    Get promise tracking analysis for an official.
    Compares campaign promises to actual voting record.

    Args:
        official_id: Official ID

    Returns:
        Promise tracking with kept/broken status
    """
    from datetime import datetime

    # Get official data for promises
    official_data = await get_official(official_id)
    promises_data = official_data.get("promises", {})
    official_name = official_data.get("personal", {}).get("name", "")

    # Get voting data (last 3 years)
    current_year = datetime.utcnow().year
    votes_data = []
    for year in [current_year, current_year - 1, current_year - 2]:
        year_votes = await get_official_votes(official_id, year)
        votes_data.append(year_votes)

    # Analyze promise keeping
    analysis = await promise_service.analyze_promise_keeping(
        official_id,
        official_name,
        promises_data,
        votes_data
    )

    logger.info("promise_tracker", official_id=official_id,
                score=analysis.get("summary", {}).get("promise_keeping_score"))

    return analysis


@router.get("/{official_id}/red-flags")
async def get_red_flags(official_id: str):
    """
    Get red flags for an official.
    Automatic detection of problematic patterns.

    Args:
        official_id: Official ID

    Returns:
        Red flags with severity and details
    """
    from datetime import datetime

    # Get all necessary data
    official_data = await get_official(official_id)

    current_year = datetime.utcnow().year

    # Get promise analysis
    try:
        promise_analysis = await get_promise_tracker(official_id)
    except Exception as e:
        logger.warning("promise_analysis_failed", official_id=official_id, error=str(e))
        promise_analysis = None

    # Get influence analysis
    try:
        influence_analysis = await get_influence_analysis(official_id)
    except Exception as e:
        logger.warning("influence_analysis_failed", official_id=official_id, error=str(e))
        influence_analysis = None

    # Get votes data
    votes_data = []
    for year in [current_year, current_year - 1]:
        year_votes = await get_official_votes(official_id, year)
        votes_data.append(year_votes)

    # Get donations data
    donations_data = await get_official_donations(official_id, "2024")

    # Get stocks data
    stocks_data = await get_official_stocks(official_id, current_year)

    # Detect red flags
    red_flags = await red_flags_service.detect_red_flags(
        official_id,
        official_data,
        promise_analysis,
        influence_analysis,
        votes_data,
        donations_data,
        stocks_data
    )

    logger.info("red_flags", official_id=official_id,
                total=red_flags.get("total_red_flags"),
                critical=red_flags.get("by_severity", {}).get("critical", 0))

    return red_flags


@router.get("/{official_id}/accountability-score")
async def get_accountability_score(official_id: str):
    """
    Get comprehensive accountability score for an official.
    Combines promise keeping, transparency, attendance, and donor independence.

    Args:
        official_id: Official ID

    Returns:
        Accountability score with component breakdown
    """
    from datetime import datetime

    # Get all necessary data
    official_data = await get_official(official_id)

    current_year = datetime.utcnow().year

    # Get promise analysis
    try:
        promise_analysis = await get_promise_tracker(official_id)
    except Exception as e:
        logger.warning("promise_analysis_failed", official_id=official_id, error=str(e))
        promise_analysis = None

    # Get influence analysis
    try:
        influence_analysis = await get_influence_analysis(official_id)
    except Exception as e:
        logger.warning("influence_analysis_failed", official_id=official_id, error=str(e))
        influence_analysis = None

    # Get votes data
    votes_data = []
    for year in [current_year, current_year - 1]:
        year_votes = await get_official_votes(official_id, year)
        votes_data.append(year_votes)

    # Get donations data
    donations_data = await get_official_donations(official_id, "2024")

    # Get red flags
    try:
        red_flags = await get_red_flags(official_id)
    except Exception as e:
        logger.warning("red_flags_failed", official_id=official_id, error=str(e))
        red_flags = None

    # Calculate accountability score
    score = await accountability_score_service.calculate_accountability_score(
        official_id,
        official_data,
        promise_analysis,
        influence_analysis,
        votes_data,
        donations_data,
        red_flags
    )

    logger.info("accountability_score", official_id=official_id,
                score=score.get("overall_score"),
                grade=score.get("grade"))

    return score
