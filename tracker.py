from typing import Dict

Fingerprint = Dict[str, object]


def similarity_score(reference: Fingerprint, session: Fingerprint) -> float:
    """Simple toy tracker: higher score = more likely same user."""
    score = 0.0

    if reference["platform"] == session["platform"]:
        score += 1.0

    if reference["language"] == session["language"]:
        score += 1.0

    if reference["timezone"] == session["timezone"]:
        score += 1.0

    if (
        reference["screen_width"] == session["screen_width"]
        and reference["screen_height"] == session["screen_height"]
    ):
        score += 1.0
    else:
        width_diff = abs(int(reference["screen_width"]) - int(session["screen_width"]))
        height_diff = abs(int(reference["screen_height"]) - int(session["screen_height"]))
        if width_diff <= 120 and height_diff <= 120:
            score += 0.5

    return score



def predict_same_user(reference: Fingerprint, session: Fingerprint, threshold: float = 3.0) -> bool:
    return similarity_score(reference, session) >= threshold
