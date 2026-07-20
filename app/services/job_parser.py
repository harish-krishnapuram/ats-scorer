"""
Extracts keywords, required skills, and qualifications from a job description.
"""


def extract_keywords(description: str) -> list[str]:
    """
    Extract meaningful keywords/skills from a job description
    (e.g. tokenize, remove stopwords, match against a skills dictionary).
    """
    # TODO: implement keyword extraction (spaCy / keyword lists / TF-IDF)
    return []


def extract_requirements(description: str) -> dict:
    """
    Split description into structured sections: responsibilities,
    required qualifications, preferred qualifications.
    """
    # TODO: implement section parsing
    return {
        "responsibilities": [],
        "required_qualifications": [],
        "preferred_qualifications": [],
    }
