"""
Generates actionable resume improvement suggestions based on the
gap between resume content and job requirements.
"""


def generate_suggestions(missing_keywords: list[str], match_score: float) -> list[str]:
    suggestions: list[str] = []

    if missing_keywords:
        top_missing = ", ".join(missing_keywords[:8])
        suggestions.append(f"Consider adding these missing keywords if relevant to your experience: {top_missing}.")

    if match_score < 50:
        suggestions.append("Your resume has a low keyword match. Tailor it more closely to this job description.")
    elif match_score < 80:
        suggestions.append("Good match, but a few tweaks to keywords and phrasing could improve ATS ranking.")
    else:
        suggestions.append("Strong match with this job description.")

    # TODO: add suggestions for formatting, section ordering, quantified achievements, etc.
    return suggestions
