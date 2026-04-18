"""
app/services/agent_investigator.py
───────────────────────────────────
Rule-based SAR (Suspicious Activity Report) generator.
Produces deterministic, structured investigation reports from transaction
data without requiring any external LLM or Ollama installation.

The output is indistinguishable from an LLM report in a demo context
and is 100% grounded in actual transaction data — no hallucinations.
"""
import logging
from app.models.transaction import Transaction

logger = logging.getLogger(__name__)


class AgentInvestigator:

    def generate_transaction_summary(
        self,
        transaction: Transaction,
        breakdown: list[dict],
        risk_score: float,
        model_name: str = "rule-engine-v1",   # kept for API compat
    ) -> dict:
        """
        Synthesize the structured breakdown into a plain-English SAR report.
        Fully deterministic — no LLM required.
        """
        try:
            return _build_report(transaction, breakdown, risk_score)
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            return {
                "summary": "Unable to generate investigation report.",
                "risk_level": "Unknown",
                "recommended_action": "Manual review required.",
                "bullet_points": [],
            }


def _build_report(transaction: Transaction, breakdown: list[dict], risk_score: float) -> dict:
    decision  = transaction.decision
    amount    = transaction.amount
    location  = transaction.location
    user_id   = transaction.user_id.replace("demo_", "").replace("_", " ").title()

    # ── Collect signals from breakdown ───────────────────────────────────────
    flagged = [row for row in breakdown if row.get("status") != "normal"]
    signals = []
    loc_row  = next((r for r in breakdown if r["name"] == "Location"),  None)
    amt_row  = next((r for r in breakdown if r["name"] == "Amount"),    None)
    vel_row  = next((r for r in breakdown if r["name"] == "Velocity"),  None)

    location_new  = loc_row and loc_row.get("status") != "normal"
    amount_spike  = amt_row and amt_row.get("status") in ("elevated", "critical")
    velocity_high = vel_row and vel_row.get("status") in ("elevated", "critical")

    # ── Risk level ───────────────────────────────────────────────────────────
    if risk_score >= 75:
        risk_level = "High"
    elif risk_score >= 45:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # ── Build bullet points ───────────────────────────────────────────────────
    bullets = []

    if location_new:
        bullets.append(
            f"Transaction originated from {location}, which has never appeared in {user_id}'s transaction history."
        )
    if amount_spike:
        curr = amt_row.get("current", f"₹{amount:,.0f}")
        normal = amt_row.get("normal", "user average")
        bullets.append(f"Spend of ₹{amount:,.0f} is significantly above {user_id}'s usual pattern ({normal}).")
    if velocity_high:
        vel_curr = vel_row.get("current", "elevated activity")
        bullets.append(f"High transaction frequency detected: {vel_curr}.")

    if not bullets:
        bullets.append(f"Transaction of ₹{amount:,.0f} at {location} assessed within normal behavioral range.")

    bullets.append(f"Automated risk score: {risk_score:.0f}/100 — engine decision: {decision}.")

    # ── Summary sentence ─────────────────────────────────────────────────────
    if decision == "BLOCK":
        if velocity_high:
            summary = (
                f"Transaction blocked due to abnormal velocity — {user_id} initiated multiple "
                f"rapid transactions within a short window, consistent with card-testing or carding attack."
            )
        elif location_new and amount_spike:
            summary = (
                f"High-risk transaction detected: ₹{amount:,.0f} at an unknown location ({location}) "
                f"with spend amount significantly above {user_id}'s historical baseline."
            )
        elif location_new:
            summary = (
                f"Transaction blocked at unrecognized location ({location}). "
                f"{user_id} has no prior activity in this region — possible account compromise."
            )
        else:
            summary = (
                f"Transaction blocked by automated fraud engine. "
                f"Multiple behavioral anomalies detected for {user_id}."
            )
    elif decision == "VERIFY":
        if location_new:
            summary = (
                f"Step-up authentication required: ₹{amount:,.0f} transaction initiated from "
                f"{location}, a location not previously associated with {user_id}'s account."
            )
        elif amount_spike:
            summary = (
                f"Unusually large transaction flagged for verification: ₹{amount:,.0f} "
                f"exceeds {user_id}'s typical spending pattern and requires OTP confirmation."
            )
        else:
            summary = (
                f"Transaction flagged for step-up authentication based on behavioral pattern deviation."
            )
    else:
        summary = (
            f"Transaction of ₹{amount:,.0f} at {location} cleared within normal parameters for {user_id}."
        )

    # ── Recommended action ────────────────────────────────────────────────────
    if decision == "BLOCK":
        if velocity_high:
            action = "Freeze card temporarily and alert customer via SMS. Initiate card-testing review."
        elif location_new:
            action = "Contact customer to confirm travel. If unconfirmed, escalate to fraud operations team."
        else:
            action = "Escalate to fraud analyst for manual review. Customer contact recommended."
    elif decision == "VERIFY":
        action = "OTP sent to registered mobile. Transaction will proceed only upon successful verification."
    else:
        action = "No action required. Transaction approved and logged."

    return {
        "summary": summary,
        "risk_level": risk_level,
        "recommended_action": action,
        "bullet_points": bullets,
    }
