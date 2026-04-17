# SeedAI Hackathon Demo Script

This is your master script for the hackathon presentation. Keep this open on a secondary screen. It is specifically designed to show off the **Speed**, **Explainability**, and **Intelligence** of the system.

*(Ensure the system is running and the Simulator is open on `http://localhost:5173/simulator`)*

---

## Stage 1: The Control (ALLOW)
**Goal:** Prove the system works properly for legitimate users, showing that our math engine creates an accurate baseline.

1. **Setup:** Ensure **"Rahul"** is selected in the Left Panel.
2. **Action 1:** Under the "⚡ Scenario" menu, click **[ Safe Purchase (Baseline) ]**.
3. **Action 2:** The terminal will expect an amount. Type **`350`** and click "Pay".
4. **Talking Track:** 
   > *"Here is Rahul, a regular user buying groceries in New Delhi for ₹350. Watch the center pipeline—within 300 milliseconds, SeedAI computes his historical standard deviation, recognizes the location, and approves the payment. You can see the Ledger fill up green instantly."*
5. **Visual:** Point to the green Ledger element at the bottom showing `₹350 sent to RapidMart`.

---

## Stage 2: The Step-Up Challenge (VERIFY)
**Goal:** Prove the system detects multi-dimensional vector anomalies (Location), even if the transaction amount is perfectly normal.

1. **Setup:** Hit **[ ← New Payment ]**. Keep **"Rahul"** selected.
2. **Action 1:** Now click **[ Location Anomaly (Cloning) ]**.
3. **Action 2:** Type a normal amount, like **`400`** and click "Pay".
4. **Talking Track:** 
   > *"A fraudster has cloned Rahul's card and is trying to buy something small—just ₹400—in Zurich, hoping it flies under the radar. Because SeedAI maps behavioral geometry rather than just hard thresholds, it spots the location discrepancy instantly. The transaction is held in a VERIFY state, and funds are locked."*
5. **Action 3:** Show the OTP panel. Type `123456` and hit verify. 
6. **Talking Track:** 
   > *"If it's really Rahul traveling, he enters the SMS code, and the ledger unlocks seamlessly."*

---

## Stage 3: The Hard Stop (BLOCK)
**Goal:** Prove the system detects highly sophisticated attacks like velocity spoofing (Carding), and showcase the LLM Copilot capability.

1. **Setup:** Hit **[ ← New Payment ]**. Keep **"Rahul"** selected.
2. **Action 1:** Click **[ Velocity Spike (Carding) ]**. *(This silently injects dummy requests).*
3. **Action 2:** Type **`15000`** and click "Pay".
4. **Talking Track:** 
   > *"Here is a carding attack. Bots typically test stolen cards rapidly. Our system tracks velocity purely in volatile Redis memory for 0-latency incrementation. Look at the feature breakdown—it detected 6 transactions in an hour compared to his usual 0.1 rate. This triggers a 95+ Risk Score, and a hard BLOCK."*
5. **Action 3 (The Mic Drop):** 
   > *"But our engineers don't want to just stare at math. In the right panel, we integrated a local Qwen LLM. I'll click 'Generate SAR' [Click the LLM Copilot Button]. While routing payments takes 300ms, our offline Copilot kicks in asynchronously to write a human-readable Suspicious Activity Report (SAR) for the compliance team, explicitly explaining the velocity and category mismatch."*

---

## Stage 4: Prove It’s Dynamic (MANUAL RUN)
**Goal:** Prove nothing is hardcoded when the judges inevitably ask, *"What if it was a different scenario?"*

1. **Setup:** Hit **[ ← New Payment ]**.
2. **Action 1:** Go to the bottom left **🛠 Advanced Controls**. 
3. **Action 2:** Keep Rahul selected, but change the Location dropdown to **"Mumbai"**.
4. **Action 3:** Click **[ Launch Injection ➔ ]**.
5. **Action 4:** Type **`20000`** and hit "Pay".
6. **Talking Track:** 
   > *"To prove this system is dynamic: if a judge asks me to simulate a domestic flight anomaly, I just override the location. Notice how the mathematical ratios map perfectly in real-time, catching the ₹20,000 threshold break alongside the Mumbai location mismatch."*
