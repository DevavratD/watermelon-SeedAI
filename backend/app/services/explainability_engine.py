"""
app/services/explainability_engine.py
──────────────────────────────────────
Deterministic human-readable reasons + structured visual breakdown.

generate_reasons() → top-3 bullet strings for API / legacy use
generate_breakdown() → structured list for the frontend explainability table

The impact score perfectly reflects the backend weighted normalization,
clamped to a minimum of 10 for UI visibility as requested.
"""
from ml_pipeline.features import TransactionFeatures
from app.services.rules_engine import RuleResult, WEIGHTS, CEILINGS


class ExplainabilityEngine:

    def generate_reasons(
        self,
        features: TransactionFeatures,
        rule_result: RuleResult,
        hard_block: bool = False,
        hard_reason: str = "",
    ) -> list[str]:
        """
        Build final reason list for the API response.
        """
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
        Build deterministic breakdown for the frontend explainability table.
        Impact is mathematically grounded in `rules_engine.WEIGHTS`.
        """
        breakdown = []
        currency = "₹"

        # ─── Amount ───────────────────────────────────────────────────────────
        raw_amt_dev = features.amount_deviation
        norm_amt = min(raw_amt_dev / CEILINGS["amount_deviation"], 1.0)
        amt_raw_impact = int(norm_amt * WEIGHTS["amount_deviation"] * 100)

        if amt_raw_impact > 5:
            avg_str = f"{currency}{profile_avg:,.0f}" if profile_count >= 3 else "New user"
            curr_str = f"{currency}{features.amount:,.0f}"
            # Always compute ratio from the passed-in profile_avg (which may be pinned for demo)
            ratio = (features.amount / profile_avg) if profile_avg > 0 else features.amount_to_avg_ratio

            contrast_str = f"{avg_str} → {curr_str} ({ratio:.1f}x increase)"

            amt_impact = int(min(100, max(10, amt_raw_impact)))
            amt_status = "critical" if ratio >= 5.0 else "elevated"

            breakdown.append({
                "name": "Amount",
                "normal": avg_str,
                "current": contrast_str,
                "impact": amt_impact,
                "status": amt_status,
            })

        # ─── Merchant / Location ──────────────────────────────────────────────
        raw_loc = float(features.location_is_new)
        norm_loc = min(raw_loc / CEILINGS["location_change"], 1.0)
        loc_raw_impact = int(norm_loc * WEIGHTS["location_change"] * 100)

        if loc_raw_impact > 5:
            loc_impact = int(min(100, max(10, loc_raw_impact)))
            breakdown.append({
                "name": "Merchant",
                "normal": "Known",
                "current": f"New ({features.raw_location})",
                "impact": loc_impact,
                "status": "elevated",
            })

        # ─── Time of Day ─────────────────────────────────────────────────────
        raw_time = float(features.time_anomaly)
        norm_time = min(raw_time / CEILINGS["time_anomaly"], 1.0)
        time_raw_impact = int(norm_time * WEIGHTS["time_anomaly"] * 100)

        if time_raw_impact > 5:
            time_impact = int(min(100, max(10, time_raw_impact)))
            hour = features.raw_hour
            time_label = "Night" if (22 <= hour < 24 or 0 <= hour < 5) else "Unusual Hour"
            breakdown.append({
                "name": "Time of Day",
                "normal": "Business Hours",
                "current": time_label,
                "impact": time_impact,
                "status": "elevated",
            })

        # ─── Velocity ────────────────────────────────────────────────────────
        raw_freq = features.frequency_spike
        norm_freq = min(raw_freq / CEILINGS["frequency_spike"], 1.0)
        freq_raw_impact = int(norm_freq * WEIGHTS["frequency_spike"] * 100)

        if freq_raw_impact > 5:
            freq_impact = int(min(100, max(10, freq_raw_impact)))
            vel = features.txn_count_1h
            freq_status = "critical" if vel >= 6 else "elevated"
            breakdown.append({
                "name": "Velocity",
                "normal": "1-2/hr",
                "current": f"Normal → {vel}/hr ({raw_freq:.1f}x spike)",
                "impact": freq_impact,
                "status": freq_status,
            })

        return breakdown

    def _fallback_reasons(self, features: TransactionFeatures) -> list[str]:
        reasons = []
        if features.amount_to_avg_ratio > 1.5:
            reasons.append(f"Amount: {features.amount_to_avg_ratio:.1f}x above user average")
        if features.txn_count_1h > 2:
            reasons.append(f"Elevated activity: {features.txn_count_1h} transactions in last hour")
        if not reasons:
            reasons.append("Anomaly detected by behavioral analysis")
        return reasons

