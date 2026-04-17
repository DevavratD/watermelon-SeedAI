# 🖥️ The Prototype Interface

The SeedAI prototype focuses on visualizing the invisible. Modern consumers and even bank tellers rarely see *how* payments are mapped. Our frontend (React/Vite) creates a 3-Panel glass-box presentation of the fraud engine running live.

## The 3-Panel Layout

### 1. Left Panel: Scenario Injection
To reliably demonstrate fraud vectors without hardcoding rules into buttons, we built an interactive **Attack Scenario Injector**.
It offers:
*   **Smart Presets:** 1-click injections that populate the payload with a Safe Purchase, a Location Anomaly (Cloning), or a Velocity Spike (Carding Attack). This guarantees the engine experiences the exact anomaly we are trying to catch.
*   **Advanced Overrides:** A dropdown menu allows presenters to manually manipulate geo-location variables on the fly, proving the engine computes dynamic responses.

### 2. Center Panel: The Pipeline Router
When a transaction is fired, the center panel visually unpacks the math occurring under the hood over 400 milliseconds. 
We expose the payload mapping, then render the **Feature Breakdown**: showing exact contrast ratios (e.g., this user spends ₹300 on average. This transaction is for ₹20,000. It highlights `57.1x Amount Deviation` in bright orange).

### 3. Right Panel: Output & Explanation
The engine categorizes the outcome securely.
*   **Transfer Ledger Visualization:** For an `ALLOW`, the engine prints "Ledger Sequence Initiated" and visually maps funds flowing successfully to the merchant. For a `BLOCK`, the engine renders a locked "Transfer Halted" frame.
*   **Step-Up Auth:** If the engine spots mid-level risk (like a location mismatch but appropriate amount), it triggers `VERIFY` and spawns an interactive OTP modal. The user can type `123456` to pass authentication and unlock the ledger dynamically.
*   **Agentic Copilot:** Regardless of the outcome, an LLM COPILOT button sits below the ledger. Clicking it interfaces with an asynchronous local LLM to draft a formal intelligence report on the transaction, proving that complex generative AI can run parallel to, rather than blocking, core payment workflows.
