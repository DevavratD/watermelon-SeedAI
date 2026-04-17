# 🛡️ SeedAI: Dual-Tier Fraud Intelligence Engine

> **A high-speed, transparent, and agentic fraud detection system designed for modern fintech.**

![SeedAI Banner](frontend/public/SeedAI_logo.svg) <!-- Replace with actual banner if available -->

## 🚀 The Core Problem
Modern financial institutions face an impossible tradeoff:
1. **Machine Learning is deep but slow.** You cannot block a transaction payment route for 5 seconds waiting for a heavy neural network or LLM to process it.
2. **Rules Engines are fast but brittle.** Hardcoded thresholds ($10,000 limits) are easily bypassed by sophisticated bots making micro-transactions, or they generate massive false-positive rates for legitimate high-net-worth users.

## 💡 The SeedAI Solution
**SeedAI** introduces a **Dual-Tier Intelligence Architecture** that fundamentally resolves the speed vs. intelligence tradeoff.

1. **Tier 1: Synchronous Deterministic Engine (Sub-300ms)**
   We use Welford's online variance algorithm to constantly update user behavioral profiles in O(1) time. Every transaction is filtered through mathematical baselines (Amount Deviation, Location Anomaly, Velocity Spikes). It instantly routes the transaction to `ALLOW`, `VERIFY` (Step-Up Auth), or `BLOCK`.
2. **Tier 2: Asynchronous Agentic Workflow (LLM Copilot)**
   While the payment flow resolves instantly for the user, blocked or suspicious transactions trigger an asynchronous backend event. Our local LLM (Qwen3) digests the raw JSON payload and mathematical deviations to generate a human-readable Suspicious Activity Report (SAR) for the compliance team.

## ✨ Key Features
* **Live Behavioral Anchoring:** Math is relative to the user. A ₹500 charge in Zurich is blocked for a Delhi user, while a ₹20,000 charge is approved for a High-Net-Worth individual.
* **Extreme Transparency:** Our `feature_breakdown` exposes exactly *why* a transaction was flagged (e.g., "57.1x Amount Deviation"), completely removing the "black box" ML problem.
* **Interactive Scenario Injector:** Built-in UI to simulate complex attacks (Velocity carding, Location cloning) live during a demo.
* **Transfer Ledger UI:** Visual proof of funds locking or routing based on engine decisions.

## 🛠️ Quick Start

**1. Start the Backend (FastAPI)**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. Start the Frontend (Vite/React)**
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173/simulator` to run the live demo.

---
*Built for the 2026 Hackathon.*