"""
Core ATS matching engine. Required skills count more than preferred ones,
and each requirement group is satisfied if the resume has ANY ONE skill
from that group (handles "X/Y" or "X or Y" job description phrasing).
"""

REQUIRED_WEIGHT = 2
PREFERRED_WEIGHT = 1


def compute_weighted_match(resume_skills: list[str], requirement_groups) -> dict:
    resume_set = {s.lower().strip() for s in resume_skills}

    # Defensive: older job rows may still have the pre-upgrade flat-list format.
    if not isinstance(requirement_groups, dict):
        flat_list = requirement_groups if isinstance(requirement_groups, list) else []
        requirement_groups = {"required": [[kw] for kw in flat_list], "preferred": []}

    req_earned, req_possible, req_matched, req_missing = _score_groups(
        resume_set, requirement_groups.get("required", []), REQUIRED_WEIGHT
    )
    pref_earned, pref_possible, pref_matched, pref_missing = _score_groups(
        resume_set, requirement_groups.get("preferred", []), PREFERRED_WEIGHT
    )

    total_possible = req_possible + pref_possible
    total_earned = req_earned + pref_earned
    match_score = round((total_earned / total_possible) * 100, 2) if total_possible else 0.0

    return {
        "match_score": match_score,
        "matched_keywords": req_matched + pref_matched,
        "missing_keywords": req_missing + pref_missing,
    }


def _score_groups(resume_set: set[str], groups: list[list[str]], weight: int):
    if not groups:
        return 0.0, 0.0, [], []

    earned = 0.0
    matched, missing = [], []
    for group in groups:
        group_set = {g.lower().strip() for g in group}
        label = " / ".join(group)
        if resume_set & group_set:
            earned += weight
            matched.append(label)
        else:
            missing.append(label)

    possible = weight * len(groups)
    return earned, possible, matched, missing