"""
Core ATS matching engine: compares parsed resume data against parsed
job keywords/requirements and produces a match score.
"""


def compute_match_score(resume_skills: list[str], job_keywords: list[str]) -> float:
    """
    Return a 0-100 match score based on overlap between resume skills
    and job keywords. Replace with a weighted / semantic-similarity
    approach (e.g. embeddings) as the engine matures.
    """
    if not job_keywords:
        return 0.0

    resume_set = {s.lower().strip() for s in resume_skills}
    job_set = {k.lower().strip() for k in job_keywords}

    matched = resume_set & job_set
    return round(len(matched) / len(job_set) * 100, 2)


def get_matched_and_missing(resume_skills: list[str], job_keywords: list[str]) -> tuple[list[str], list[str]]:
    resume_set = {s.lower().strip() for s in resume_skills}
    job_set = {k.lower().strip() for k in job_keywords}

    matched = sorted(resume_set & job_set)
    missing = sorted(job_set - resume_set)
    return matched, missing
