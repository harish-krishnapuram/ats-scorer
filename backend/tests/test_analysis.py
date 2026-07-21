"""
Tests for the ATS scoring engine and the /analysis endpoint's core logic.
"""
from app.services.ats_engine import compute_match_score, get_matched_and_missing
from app.services.suggestion_engine import generate_suggestions


def test_compute_match_score_full_match():
    resume_skills = ["python", "django", "react"]
    job_keywords = ["python", "django", "react"]
    assert compute_match_score(resume_skills, job_keywords) == 100.0


def test_compute_match_score_partial_match():
    resume_skills = ["python", "django"]
    job_keywords = ["python", "django", "react", "postgresql"]
    score = compute_match_score(resume_skills, job_keywords)
    assert score == 50.0


def test_compute_match_score_no_job_keywords():
    assert compute_match_score(["python"], []) == 0.0


def test_get_matched_and_missing():
    resume_skills = ["Python", "Django"]
    job_keywords = ["python", "react"]
    matched, missing = get_matched_and_missing(resume_skills, job_keywords)
    assert matched == ["python"]
    assert missing == ["react"]


def test_generate_suggestions_low_score():
    suggestions = generate_suggestions(["react", "aws"], 30.0)
    assert any("low keyword match" in s.lower() for s in suggestions)
