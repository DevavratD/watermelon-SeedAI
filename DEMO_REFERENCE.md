# SeedAI — Architecture & Demo Reference

> Last updated: April 2026
> Note: Describes the exact current architecture as implemented in the codebase.

---

## 1. Architecture Overview

The system visually demonstrates a dual-tier fraud detection architecture acting in real-time, built over a Python/FastAPI backend and an interactive Vite/React frontend.

1. **System Visibility Simulator (`/simulator`)**: The primary presentation view. Overhauled into a 3-panel layout to dynamically reveal the internal mechanics of the SeedAI Fraud Engine as transactions are simulated. It marries a high-speed deterministic rules engine with an asynchronous Large Language Model (Agent Investigator).

---

## 2. Live POS Simulator (`/simulator`)

The main `SimulatorPage.tsx` interface uses a rich, dark-mode 3-panel grid layout.

### Left Panel: User Context & Attack Vectors
1.  **User Profile Header (`UserProfilePanel.tsx`)**: Displays the active persona (e.g. Rahul, regular low-spender), switching between users triggers different hardcoded baseline behaviors in the backend. 
2.  **Attack Scenario Injector (`QRScanner.tsx`)**: A grid of preset demo attacks replacing the old physical camera scanner. 
    *   **Safe Purchase**: Injects normal parameters (Grocery, New Delhi).
    *   **Location Anomaly (Cloning)**: Injects an impossible travel vector (Jewelry, Zurich, Switzerland).
    *   **Velocity Spike (Carding)**: Hooks to `POST /simulate-velocity/:id` to instantly inject rapid dummy logs into Redis before firing the transaction.
3.  **Amount Entry (`AmountEntry.tsx`)**: An interactive numpad where the presenter types the amount to finalize the trap.

### Center Panel: The Decision Pipeline
*   **Component**: `TransactionPipeline.tsx`
*   **Behavior**: When "Pay" is clicked, it visually staggers the backend execution via Framer Motion to explain the engine's speed:
    *   *Stage 1:* Incoming Request (Displays Raw Payload)
    *   *Stage 2:* Behavioral Analysis (Displays Math-based `feature_breakdown`, highlighting contrast ratios like `57.1x`).
    *   *Stage 3:* Risk Engine (Outputs ML Score & Rule Score)

### Right Panel: Final Decision & Explanations
*   **Component**: `DecisionPanel.tsx`
*   **Action Paths**:
    *   If `BLOCK` (>80 Risk): Hard halts the transfer.
    *   If `VERIFY` (60-80 Risk): Opens the interactive `OTPPanel.tsx` requiring an SMS code to clear.
    *   If `ALLOW` (<60 Risk): Clears the transaction.
*   **Transfer Ledger UI**: Visually proves the physical routing of funds. Displays an animated filling green progress bar for `ALLOW` ("Ledger Sequence Initiated"), or a dashed red "Transfer Halted" frame for blocked funds to add physical stakes to the demo.
*   **Agentic Investigation (LLM COPILOT)**: An asynchronous section containing the "Generate SAR" button. It hits `GET /api/v1/investigate/:id`, triggering a local `qwen3:1.7b` Ollama model to write a human-readable Suspicious Activity Report without blocking the main 300ms transaction flow.

---

## 3. Backend Engine Integration

The FastAPI container handles requests synchronously for math and asynchronously for LLMs (`transactions.py`):

*   **POST** `/api/v1/analyze-transaction`: The primary ingest. Generates a risk score via `behavior_engine.py` (which tracks Welford's online variance algorithm and rolling averages) and returns the JSON `feature_breakdown`. 
*   **POST** `/api/v1/simulate-velocity/{user_id}`: Artificial injector script that loops `rcache.increment(user_id)` 5 times. Used by the Scenario Grid to simulate a high-speed carding bot purely for demoing.
*   **POST** `/api/v1/verify-transaction`: Validates step-up auth (OTP) to switch a pending `VERIFY` status to a success ledger status.
*   **GET** `/api/v1/investigate/{transaction_id}`: The Agentic Workflow layer. Evaluates the completed mathematical breakdown via constraint-prompting `qwen3:1.7b` to simulate an AI Analyst reviewing the blocked case.
