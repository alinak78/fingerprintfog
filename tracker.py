from typing import Dict

Fingerprint = Dict[str, object]

# Weights based on Cover Your Tracks "bits of identifying information"
# for the features used in this demo.
# Higher bits = more identifying = higher weight.
FEATURE_WEIGHTS = {
    "screen": 7.72,     # Screen size and color depth
    "timezone": 3.51,   # Time zone
    "platform": 3.01,   # Platform
    "language": 0.90,   # Language
}

MAX_SCORE = sum(FEATURE_WEIGHTS.values())


def similarity_score(reference: Fingerprint, session: Fingerprint) -> float:
    """
    Weighted tracker: higher score = more likely same user.
    More identifying features contribute more to the score.
    """
    score = 0.0

    if reference["platform"] == session["platform"]:
        score += FEATURE_WEIGHTS["platform"]

    if reference["language"] == session["language"]:
        score += FEATURE_WEIGHTS["language"]

    if reference["timezone"] == session["timezone"]:
        score += FEATURE_WEIGHTS["timezone"]

    # Screen gets the largest weight because Cover Your Tracks reports
    # screen size/color depth as highly identifying in this browser report.
    if (
        reference["screen_width"] == session["screen_width"]
        and reference["screen_height"] == session["screen_height"]
    ):
        score += FEATURE_WEIGHTS["screen"]
    else:
        width_diff = abs(int(reference["screen_width"]) - int(session["screen_width"]))
        height_diff = abs(int(reference["screen_height"]) - int(session["screen_height"]))

        # Partial credit for close screen sizes.
        if width_diff <= 120 and height_diff <= 120:
            score += FEATURE_WEIGHTS["screen"] * 0.5

    return score


def normalized_similarity_score(reference: Fingerprint, session: Fingerprint) -> float:
    """
    Returns similarity between 0 and 1.
    Easier to interpret than raw weighted score.
    """
    return similarity_score(reference, session) / MAX_SCORE


def predict_same_user(
    reference: Fingerprint,
    session: Fingerprint,
    threshold: float = 0.65
) -> bool:
    """
    Predict same user if normalized weighted similarity is above threshold.
    """
    return normalized_similarity_score(reference, session) >= threshold