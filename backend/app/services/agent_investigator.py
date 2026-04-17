"""
app/services/agent_investigator.py
───────────────────────────────────
Agentic Workflow: Uses Gemini to investigate a flagged transaction
and write a human-readable Suspicious Activity Report (SAR).
"""
import json
import logging
from typing import Optional

import ollama
from pydantic import BaseModel, Field

from config.settings import settings
from app.models.transaction import Transaction
from app.models.behavior_profile import UserBehaviorProfile

logger = logging.getLogger(__name__)


class AgentInvestigator:

    def generate_transaction_summary(
        self,
        transaction: Transaction,
        breakdown: list[dict],
        risk_score: float,
        model_name: str = "qwen3:1.7b"
    ) -> dict:
        """
        Synthesize the structured breakdown into a strict, hallucination-free SAR report.
        """

        # Build context for the LLM
        txn_data = {
            "transaction_id": transaction.transaction_id,
            "amount": transaction.amount,
            "location": transaction.location,
            "timestamp": transaction.timestamp.isoformat(),
            "decision": transaction.decision,
            "risk_score": risk_score,
            "structured_breakdown": breakdown
        }

        # Tight prompt to force minimal token output (improves latency)
        prompt = f"""
        You are a fraud analyst.
        Explain this transaction based ONLY on the provided data. Be extremely brief (max 2 sentences).

        Data:
        {json.dumps(txn_data, indent=2)}

        Respond ONLY with a valid JSON object matching exactly this schema:
        {{
          "summary": "1 sentence core issue.",
          "risk_level": "High/Medium/Low",
          "recommended_action": "1 sentence action.",
          "bullet_points": ["Fact 1", "Fact 2"]
        }}
        """

        try:
            response = ollama.chat(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}],
                format='json',
                options={'temperature': 0.1}
            )
            report = json.loads(response['message']['content'])
            return report
        except Exception as e:
            logger.error(f"Agent investigator failed: {e}")
            return {
                "summary": f"Failed to generate report: {str(e)}",
                "risk_level": "Unknown",
                "recommended_action": "Manual review required",
                "bullet_points": ["LLM generation failed"]
            }
