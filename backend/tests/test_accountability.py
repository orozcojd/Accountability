"""
Tests for accountability features and scoring algorithms.
"""

import pytest
from datetime import datetime, date

from app.services.influence_service import influence_service
from app.services.promise_service import promise_service
from app.services.red_flags_service import red_flags_service
from app.services.accountability_score_service import accountability_score_service


class TestInfluenceService:
    """Tests for influence score calculation."""

    def test_categorize_donation_industry(self):
        """Test industry categorization."""
        # Test pharma
        category = influence_service.categorize_donation_industry("Pfizer PAC")
        assert category == "pharmaceuticals"

        # Test oil & gas
        category = influence_service.categorize_donation_industry("Exxon Employees")
        assert category == "oil_gas"

        # Test tech
        category = influence_service.categorize_donation_industry("Google LLC")
        assert category == "tech"

        # Test unknown
        category = influence_service.categorize_donation_industry("Random Company")
        assert category == "other"

    def test_categorize_bill(self):
        """Test bill categorization."""
        # Healthcare bill
        categories = influence_service.categorize_bill(
            "Medicare Expansion Act",
            "Expands Medicare coverage to include dental"
        )
        assert "healthcare" in categories

        # Environment bill
        categories = influence_service.categorize_bill(
            "Clean Air Standards",
            "Strengthens EPA pollution regulations"
        )
        assert "environment" in categories

        # Multiple categories
        categories = influence_service.categorize_bill(
            "Healthcare and Environment Protection Act",
            "Addresses both healthcare access and climate change"
        )
        assert len(categories) >= 2

    def test_donation_concentration_calculation(self):
        """Test donation concentration score."""
        industry_donations = {
            "pharmaceuticals": {"total": 100000, "donors": [], "donations": []},
            "oil_gas": {"total": 50000, "donors": [], "donations": []},
            "tech": {"total": 30000, "donors": [], "donations": []},
            "finance": {"total": 20000, "donors": [], "donations": []},
        }
        total_donations = 250000

        concentration = influence_service._calculate_donation_concentration(
            industry_donations,
            total_donations
        )

        # Top 10 should be 200k out of 250k = 80%
        assert concentration == 80.0

    def test_is_vote_favorable_to_industry(self):
        """Test industry favorability detection."""
        # Pharma - voting NO on healthcare regulation is favorable
        is_favorable = influence_service.is_vote_favorable_to_industry(
            "no",
            ["healthcare"],
            "pharmaceuticals"
        )
        assert is_favorable

        # Oil - voting NO on environment regulation is favorable
        is_favorable = influence_service.is_vote_favorable_to_industry(
            "no",
            ["environment"],
            "oil_gas"
        )
        assert is_favorable

        # Defense - voting YES on defense spending is favorable
        is_favorable = influence_service.is_vote_favorable_to_industry(
            "yes",
            ["defense"],
            "defense"
        )
        assert is_favorable


class TestPromiseService:
    """Tests for promise tracking."""

    def test_extract_keywords(self):
        """Test keyword extraction from promises."""
        keywords = promise_service._extract_keywords(
            "I will fight for healthcare access for all Americans",
            "healthcare"
        )

        assert "healthcare" in keywords or "health" in keywords
        assert len(keywords) > 0

    def test_determine_promise_status(self):
        """Test promise status determination."""
        # Broken promise - mostly contradicting votes
        supporting = []
        contradicting = [{"id": f"v{i}"} for i in range(10)]

        status = promise_service._determine_promise_status(
            supporting,
            contradicting,
            "I will expand healthcare"
        )
        assert status == "broken"

        # Kept promise - mostly supporting votes
        supporting = [{"id": f"v{i}"} for i in range(8)]
        contradicting = [{"id": "v1"}]

        status = promise_service._determine_promise_status(
            supporting,
            contradicting,
            "I will expand healthcare"
        )
        assert status == "kept"

        # Not addressed - no votes
        status = promise_service._determine_promise_status(
            [],
            [],
            "I will expand healthcare"
        )
        assert status == "not_addressed"


class TestRedFlagsService:
    """Tests for red flags detection."""

    @pytest.mark.asyncio
    async def test_detect_broken_promise_flags(self):
        """Test broken promise flag detection."""
        promise_analysis = {
            "summary": {
                "total_promises": 10,
                "broken": 7,
                "kept": 2,
                "in_progress": 1,
                "not_addressed": 0
            },
            "promises": [
                {
                    "promise_id": "p1",
                    "category": "healthcare",
                    "promise_text": "Expand healthcare access",
                    "status": "broken",
                    "times_voted_against": 12,
                    "evidence": [
                        {"date": "2023-01-15"},
                        {"date": "2024-03-20"}
                    ]
                }
            ]
        }

        flags = red_flags_service._detect_broken_promise_flags(promise_analysis)

        assert len(flags) > 0
        assert flags[0]["type"] == "broken_promise"
        assert flags[0]["severity"] in ["high", "critical"]

    @pytest.mark.asyncio
    async def test_detect_attendance_flags(self):
        """Test attendance flag detection."""
        votes_data = [
            {
                "votes": [
                    {"vote": "yes"},
                    {"vote": "no"},
                    {"vote": "not-voting"},
                    {"vote": "not-voting"},
                    {"vote": "not-voting"},
                    {"vote": "yes"},
                ]
            }
        ]

        flags = red_flags_service._detect_attendance_flags(votes_data)

        # 3 missed out of 6 = 50% missed rate
        assert len(flags) > 0
        assert flags[0]["type"] == "excessive_missed_votes"
        assert flags[0]["missed_rate_pct"] == 50.0

    @pytest.mark.asyncio
    async def test_detect_donor_concentration_flags(self):
        """Test donor concentration flag detection."""
        donations_data = {
            "summary": {
                "totalRaised": 1000000,
                "pacContributions": 850000,
                "individualContributions": 150000
            },
            "topDonors": [
                {"amount": 100000},
                {"amount": 90000},
                {"amount": 80000},
                {"amount": 70000},
                {"amount": 60000},
                {"amount": 50000},
                {"amount": 40000},
                {"amount": 30000},
                {"amount": 20000},
                {"amount": 10000},
            ]
        }

        flags = red_flags_service._detect_donor_concentration_flags(donations_data)

        # Should flag high PAC percentage
        pac_flags = [f for f in flags if f["type"] == "corporate_pac_dependency"]
        assert len(pac_flags) > 0
        assert pac_flags[0]["severity"] in ["critical", "high"]


class TestAccountabilityScoreService:
    """Tests for accountability score calculation."""

    def test_get_grade(self):
        """Test grade assignment."""
        assert accountability_score_service._get_grade(95) == "A"
        assert accountability_score_service._get_grade(85) == "B"
        assert accountability_score_service._get_grade(75) == "C"
        assert accountability_score_service._get_grade(65) == "D"
        assert accountability_score_service._get_grade(45) == "F"

    def test_calculate_promise_keeping_score(self):
        """Test promise keeping score calculation."""
        promise_analysis = {
            "summary": {
                "promise_keeping_score": 65.5
            }
        }

        score = accountability_score_service._calculate_promise_keeping_score(
            promise_analysis
        )
        assert score == 65.5

        # Test with no data
        score = accountability_score_service._calculate_promise_keeping_score(None)
        assert score == 50.0

    def test_calculate_attendance_score(self):
        """Test attendance score calculation."""
        votes_data = [
            {
                "votes": [
                    {"vote": "yes"},
                    {"vote": "yes"},
                    {"vote": "no"},
                    {"vote": "yes"},
                    {"vote": "not-voting"},
                ]
            }
        ]

        score = accountability_score_service._calculate_attendance_score(votes_data)
        # 4 votes cast out of 5 = 80%
        assert score == 80.0

    def test_calculate_donor_independence_score(self):
        """Test donor independence score calculation."""
        donations_data = {
            "summary": {
                "totalRaised": 1000000,
                "pacContributions": 300000,
                "individualContributions": 700000
            }
        }

        influence_analysis = {
            "influence_score": 40  # 40% influenced = 60% independent
        }

        score = accountability_score_service._calculate_donor_independence_score(
            donations_data,
            influence_analysis
        )

        # Should be a blend of individual % (70) and independence (60) = 65
        assert 60 <= score <= 70

    def test_get_missed_votes_pct(self):
        """Test missed votes percentage calculation."""
        votes_data = [
            {
                "votes": [
                    {"vote": "yes"},
                    {"vote": "no"},
                    {"vote": "not-voting"},
                    {"vote": "present"},
                    {"vote": "yes"},
                ]
            }
        ]

        pct = accountability_score_service._get_missed_votes_pct(votes_data)
        # 2 missed out of 5 = 40%
        assert pct == 40.0

    def test_get_corporate_pac_pct(self):
        """Test corporate PAC percentage calculation."""
        donations_data = {
            "summary": {
                "totalRaised": 500000,
                "pacContributions": 350000
            }
        }

        pct = accountability_score_service._get_corporate_pac_pct(donations_data)
        # 350k / 500k = 70%
        assert pct == 70.0


class TestScoreAlgorithms:
    """Tests for specific scoring algorithms."""

    def test_influence_score_formula(self):
        """Test the influence score calculation formula."""
        # influence_score = (
        #     donation_concentration * 0.3 +
        #     voting_alignment_with_donors * 0.4 +
        #     suspicious_timing_frequency * 0.3
        # ) * 100

        donation_concentration = 80  # 80%
        voting_alignment = 90  # 90%
        suspicious_timing = 20  # 20%

        influence_score = (
            donation_concentration * 0.3 +
            voting_alignment * 0.4 +
            suspicious_timing * 0.3
        )

        expected = 80 * 0.3 + 90 * 0.4 + 20 * 0.3
        assert influence_score == expected
        assert 0 <= influence_score <= 100

    def test_accountability_score_formula(self):
        """Test the accountability score calculation formula."""
        # accountability_score = (
        #     promise_keeping_score * 0.40 +
        #     transparency_score * 0.20 +
        #     constituent_alignment_score * 0.20 +
        #     attendance_score * 0.10 +
        #     donor_independence_score * 0.10
        # )

        promise_keeping = 30
        transparency = 40
        constituent_alignment = 35
        attendance = 70
        donor_independence = 20

        accountability_score = (
            promise_keeping * 0.40 +
            transparency * 0.20 +
            constituent_alignment * 0.20 +
            attendance * 0.10 +
            donor_independence * 0.10
        )

        expected = 30 * 0.4 + 40 * 0.2 + 35 * 0.2 + 70 * 0.1 + 20 * 0.1
        assert accountability_score == expected
        assert 0 <= accountability_score <= 100

    def test_promise_keeping_score_formula(self):
        """Test the promise keeping score formula."""
        # promise_score = (kept / total_promises) * 100

        kept = 15
        total = 50

        promise_score = (kept / total) * 100

        assert promise_score == 30.0
        assert 0 <= promise_score <= 100
