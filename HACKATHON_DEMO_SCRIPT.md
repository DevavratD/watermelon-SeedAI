# SeedAI Hackathon Demo Script

This is your master script for the hackathon presentation. It is specifically designed to show off the **Context-Aware Scoring**, **Explainability**, and **Agentic Investigation** capabilities of the system.

*(Ensure the system is running and the Simulator is open on `http://localhost:5173/simulator`)*

---

## Stage 0: The Clean Slate (Important Setup)
**Goal:** Show that behavioral baselines are dynamic and clean.

1. **Setup:** On the Simulator tab, click the **"↺ Reset demo profiles"** button.
2. **Talking Track:** 
   > *"Before we begin, I'm resetting the behavioral baselines for our demo users. Unlike legacy rules engines, SeedAI dynamically learns per-category spending ceilings and location boundaries for every user. We'll start with a clean slate for Rahul."*

---

## Stage 1: The Control (ALLOW)
**Goal:** Prove the system works properly for legitimate users, showing that our math engine creates an accurate baseline without penalizing normal behavior.

1. **Setup:** Ensure **"Rahul"** is selected.
2. **Action:** Click **[ Safe Purchase (Baseline) ]**. Or enter ₹350, Groceries, New Delhi.
3. **Talking Track:** 
   > *"Here is Rahul, a regular user buying groceries in New Delhi for ₹350. Watch the center pipeline—within milliseconds, SeedAI evaluates his personal spending ceiling for groceries, recognizes his known location, and approves the payment organically."*
4. **Visual:** Point to the green `ALLOW` decision and the "Normal range" deviation in the Behavioral Analysis stage.

---

## Stage 2: The Contextual Mismatch (VERIFY)
**Goal:** Prove the system detects multi-dimensional anomalies (Location + Category), without showing confusing math.

1. **Setup:** Hit **[ ← New Payment ]**. Keep **"Rahul"** selected.
2. **Action:** Click **[ Location Anomaly ]** (e.g. ₹800 at Jewelry in Zurich).
3. **Talking Track:** 
   > *"A fraudster has cloned Rahul's card and is trying to buy something small—just ₹800—in Zurich, hoping it flies under the radar. Because SeedAI maps behavioral geometry rather than just hard thresholds, it spots the location discrepancy instantly. The transaction is held in a VERIFY state."*
4. **Visual:** Point to the breakdown: 
   > *"Notice the explainability: We don't just show 'z-score anomalies'. We tell the analyst exactly what happened in plain English: 'Zurich — never seen before'. Let's assume it's really Rahul traveling and he enters the OTP to unlock his funds."*

---

## Stage 3: The Hard Stop (BLOCK) & Velocity Attack
**Goal:** Prove the system detects highly sophisticated attacks like velocity spoofing (Carding), and showcase the Agentic LLM capability.

1. **Setup:** Hit **[ ← New Payment ]**. Keep **"Rahul"** selected.
2. **Action:** Click **[ Velocity Attack ]** (This silently injects dummy requests into the high-speed cache, then triggers a small transaction).
3. **Talking Track:** 
   > *"Here is a carding attack. Bots typically test stolen cards rapidly. Our system tracks velocity purely in volatile cache memory for 0-latency incrementation. Look at the feature breakdown—it detected 6 transactions in an hour. This triggers an instant hard BLOCK."*

---

## Stage 4: Analyst Dashboard & Agentic LLM (The Mic Drop)
**Goal:** Show how the system empowers human analysts to resolve fraud instantly.

1. **Setup:** Navigate to the **Dashboard** page (`/dashboard`).
2. **Action:** Find the blocked transaction in the table and click **Investigate >**.
3. **Talking Track:** 
   > *"But our engineers don't want analysts to just stare at math. When an analyst opens an alert, an offline local LLM Agent immediately investigates the transaction context. It generates a human-readable Suspicious Activity Report (SAR) explaining exactly why it was blocked—in this case, abnormal velocity consistent with a carding attack—and recommends freezing the card."*
4. **Action:** Point out the **Confirm Fraud** and **Mark Safe** buttons at the bottom.
5. **Talking Track:** 
   > *"The investigator can then click 'Confirm Fraud' to close the case. This feedback loop is instantly written back to our database to continuously retrain the machine learning model on emerging fraud patterns. Fast, explainable, and context-aware fraud prevention."*
6. **Action:** Click **Confirm Fraud** and show the confirmation state.
