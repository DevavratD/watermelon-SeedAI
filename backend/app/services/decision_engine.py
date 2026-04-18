"""
app/services/decision_engine.py
────────────────────────────────
Score fusion and final decision logic.

Fuses rule_score + anomaly_score into a single risk_score [0–100].
Applies decision thresholds to produce ALLOW / VERIFY / BLOCK.

Borderline uncertainty: scores within 3 points of the ALLOW threshold
get a small random nudge — makes the system feel probabilistic, not
deterministic. The BLOCK threshold has no noise (safety boundary).
"""
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

def fuse_scores(rule_score: float, anomaly_score: float) -> float:
    """
    Combine rules-based and ML scores into a single deterministic risk score [0–100].

    Weights:
        85% rule_score    — interpretable, auditable, primary signal
        15% anomaly_score — ML pattern detection (secondary, kept low since
                            IsolationForest needs more training data to be reliable)
    """
    fused = (0.85 * rule_score + 0.15 * anomaly_score) * 100
    return round(min(max(fused, 0.0), 100.0), 2)


def make_decision(risk_score: float) -> str:
    """
    Apply tiered deterministic decision thresholds.

    < 40  → ALLOW   (low risk, proceed normally)
    < 75  → VERIFY  (medium risk, require OTP confirmation)
    >= 75 → BLOCK   (high risk, transaction rejected)
    """
    if risk_score >= 75.0:
        return "BLOCK"
    if risk_score < 45.0:
        return "ALLOW"
    return "VERIFY"

