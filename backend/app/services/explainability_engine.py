"""
app/services/explainability_engine.py
──────────────────────────────────────
Deterministic human-readable reasons + structured visual breakdown.

generate_reasons() → top-3 bullet strings for API / legacy use
generate_breakdown() → structured list for the frontend explainability table

All breakdown strings are plain English — no z-scores, no raw math.
"""
from ml_pipeline.features import TransactionFeatures
from app.services.rules_engine import RuleResult, WEIGHTS, CEILINGS

# Global fallback average (used when user profile is new)
GLOBAL_AVG = 1000.0

# Merchant category display names
CATEGORY_LABELS = {
    "grocery":     "Groceries",
    "food":        "Food & Dining",
    "electronics": "Electronics",
    "digital":     "Digital / Online",
    "jewelry":     "Jewelry",
    "travel":      "Travel",
    "retail":      "Retail",
    "fuel":        "Fuel",
    "pharmacy":    "Pharmacy",
    "entertainment": "Entertainment",
}


class ExplainabilityEngine:

    def generate_reasons(
        self,
        features: TransactionFeatures,
        rule_result: RuleResult,
        hard_block: bool = False,
        hard_reason: str = "",
    ) -> list[str]:
        """Build final reason list for the API response."""
        if hard_block and hard_reason:
            return [hard_reason]

        if not rule_result:
            return self._fallback_reasons(features)

        reasons = rule_result.reasons
        if not reasons:
            reasons = self._fallback_reasons(features)

        return reasons[:3]

    def generate_breakdown(
        self,
        features: TransactionFeatures,
        profile_avg: float,
        profile_count: int,
    ) -> list[dict]:
        """
        Build plain-English breakdown for the frontend explainability table.
        No z-scores. No raw math. Judges should instantly understand each row.
        """
        breakdown = []
        currency = "₹"

        # Effective average — use profile if warmed up, else global fallback
        effective_avg = profile_avg if profile_count >= 3 else GLOBAL_AVG
        ratio = features.amount / effective_avg if effective_avg > 0 else 1.0

        # ─── Amount ───────────────────────────────────────────────────────────
        # Only flag if spending ABOVE average — spending less is never suspicious
        avg_label = f"{currency}{effective_avg:,.0f} avg" if profile_count >= 3 else "new user"

        if ratio >= 5.0:
            amt_status = "critical"
            amt_impact = min(100, int((ratio / 10.0) * 100))
            amt_current = f"{currency}{features.amount:,.0f} — {ratio:.0f}× your usual"
        elif ratio >= 2.0:
            amt_status = "elevated"
            amt_impact = min(60, int((ratio / 5.0) * 60))
            amt_current = f"{currency}{features.amount:,.0f} — {ratio:.1f}× your usual"
        else:
            # Normal — spending at or below average
            amt_status = "normal"
            amt_impact = 0
            amt_current = f"{currency}{features.amount:,.0f}"

        breakdown.append({
            "name": "Amount",
            "normal": avg_label,
            "current": amt_current,
            "impact": amt_impact,
            "status": amt_status,
        })

        # ─── Location ─────────────────────────────────────────────────────────
        raw_loc = float(features.location_is_new)
        norm_loc = min(raw_loc / CEILINGS["location_change"], 1.0)
        loc_raw_impact = int(norm_loc * WEIGHTS["location_change"] * 100)

        if loc_raw_impact > 5:
            breakdown.append({
                "name": "Location",
                "normal": "Your usual area",
                "current": f"{features.raw_location} — never seen before",
                "impact": min(100, max(10, loc_raw_impact)),
                "status": "elevated",
            })
        else:
            breakdown.append({
                "name": "Location",
                "normal": "Your usual area",
                "current": features.raw_location,
                "impact": 0,
                "status": "normal",
            })

        # ─── Velocity ────────────────────────────────────────────────────────
        raw_freq = features.frequency_spike
        norm_freq = min(raw_freq / CEILINGS["frequency_spike"], 1.0)
        freq_raw_impact = int(norm_freq * WEIGHTS["frequency_spike"] * 100)
        
        # Determine actual points added to risk
        # Note: score is scaled by 0.85 in fusion, but we show raw rule impact
        vel = features.txn_count_1h
        
        if freq_raw_impact >= 5:
            freq_status = "critical" if raw_freq >= 3.0 else "elevated"
            freq_impact = min(100, max(5, freq_raw_impact))
            if raw_freq >= 3.0:
                freq_current = f"{vel} transactions in last hour — unusual activity"
            else:
                freq_current = f"{vel} transactions in last hour — elevated pace"
        else:
            freq_status = "normal"
            freq_impact = 0
            freq_current = f"1 transaction in last hour"

        breakdown.append({
            "name": "Velocity",
            "normal": "1–2 per hour",
            "current": freq_current,
            "impact": freq_impact,
            "status": freq_status,
        })

        return breakdown

    def _fallback_reasons(self, features: TransactionFeatures) -> list[str]:
        reasons = []
        if features.amount_to_avg_ratio > 2.0:
            reasons.append(
                f"Amount {features.amount_to_avg_ratio:.1f}× above your usual spending"
            )
        if features.location_is_new:
            reasons.append(f"Transaction at unrecognized location: {features.raw_location}")
        if features.txn_count_1h > 3:
            reasons.append(f"Unusual activity: {features.txn_count_1h} transactions in the last hour")
        if not reasons:
            reasons.append("Behavioral pattern anomaly detected")
        return reasons
