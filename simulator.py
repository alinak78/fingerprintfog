import random
from typing import Dict, List

from data import BASE_FINGERPRINT, SCREEN_OPTIONS, TIMEZONE_OPTIONS, LANG_OPTIONS


Fingerprint = Dict[str, object]


def generate_baseline_sessions(n_sessions: int) -> List[Fingerprint]:
    """Return identical sessions for the non-obfuscated baseline."""
    return [BASE_FINGERPRINT.copy() for _ in range(n_sessions)]



def obfuscate_session(base: Fingerprint) -> Fingerprint:
    """Create one session with a few rotated fingerprint fields."""
    session = base.copy()

    # Rotate 2-3 easy-to-understand fields.
    if random.random() < 0.85:
        width, height = random.choice(SCREEN_OPTIONS)
        session["screen_width"] = width
        session["screen_height"] = height

    if random.random() < 0.70:
        session["timezone"] = random.choice(TIMEZONE_OPTIONS)

    if random.random() < 0.65:
        session["language"] = random.choice(LANG_OPTIONS)

    return session



def generate_obfuscated_sessions(n_sessions: int) -> List[Fingerprint]:
    """Generate n obfuscated sessions from the same base user."""
    return [obfuscate_session(BASE_FINGERPRINT) for _ in range(n_sessions)]
