"""
test_fraud_patterns.py
Live API tests against the running backend.
Tests each fraud pattern and validates expected ALLOW / VERIFY / BLOCK outcomes.

Run: python test_fraud_patterns.py
Requires: uvicorn running on localhost:8000
"""
import sys
import uuid
import time
import requests

sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://localhost:8000/api/v1"
USER = "demo_rahul"   # avg 1200, locations: [New Delhi, Mumbai]

# ── Helpers ───────────────────────────────────────────────────────────────────

def reset():
    r = requests.post(f"{BASE}/reset-demo")
    assert r.status_code == 200, f"Reset failed: {r.text}"
    print(f"        {r.json()['message']}")

def clear_vel(user=USER):
    """Clear velocity cache so tests don't bleed into each other."""
    r = requests.post(f"{BASE}/clear-velocity/{user}")
    assert r.status_code == 200, f"Clear velocity failed: {r.text}"

def analyze(amount, location, merchant_type, user=USER):
    payload = {
        "transaction_id": f"test_{uuid.uuid4().hex[:8]}",
        "user_id": user,
        "amount": amount,
        "location": location,
        "merchant_type": merchant_type,
    }
    r = requests.post(f"{BASE}/analyze-transaction", json=payload)
    assert r.status_code == 200, f"API error {r.status_code}: {r.text}"
    return r.json()

def inject_velocity(user=USER):
    r = requests.post(f"{BASE}/simulate-velocity/{user}")
    assert r.status_code == 200, f"Velocity inject failed: {r.text}"

def check(label, data, expected):
    decision = data["decision"]
    risk     = data["risk_score"]
    rule     = round(data["rule_score"] * 100)
    ml       = round(data["anomaly_score"] * 100)
    fb       = data.get("feature_breakdown", [])
    passed   = (decision == expected)
    tag      = "PASS" if passed else "FAIL"

    print(f"  [{tag}] {label}")
    print(f"         Decision : {decision}  (expected: {expected})")
    print(f"         Risk     : {risk:.1f}  |  Rule: {rule}  ML: {ml}")

    icons = {"normal": "   ", "elevated": "[!]", "critical": "[X]"}
    for row in fb:
        icon = icons.get(row["status"], "   ")
        print(f"         {icon} {row['name']:<10} {row['normal']:<22} -> {row['current']}")

    if not passed:
        print(f"         *** MISMATCH: expected {expected}, got {decision}")
    print()
    return passed

# ── Test Suite ────────────────────────────────────────────────────────────────

def run_tests():
    results = []

    print()
    print("=" * 65)
    print("  SeedAI Fraud Engine -- Pattern Tests")
    print("  User: demo_rahul | avg Rs.1,200 | Known: New Delhi, Mumbai")
    print("=" * 65)

    print("\n[SETUP] Resetting demo profiles + velocity cache...")
    reset()
    print()

    # ── 1: Baseline ───────────────────────────────────────────────────────
    print("--- SCENARIO 1: Safe Purchase (Baseline) -----------------------")
    clear_vel()
    data = analyze(300, "New Delhi", "grocery")
    results.append(check(
        "Rs.300 grocery, New Delhi — below avg, known location",
        data, "ALLOW",
    ))

    # ── 2: Slightly above average ─────────────────────────────────────────
    print("--- SCENARIO 2: Above Average, Known Location ------------------")
    clear_vel()
    data = analyze(1800, "New Delhi", "electronics")
    results.append(check(
        "Rs.1,800 electronics, New Delhi — 1.5x avg, no other flags",
        data, "ALLOW",
    ))

    # ── 3: Location Anomaly ───────────────────────────────────────────────
    print("--- SCENARIO 3: Location Anomaly (Card Abroad) -----------------")
    clear_vel()
    data = analyze(800, "Zurich, Switzerland", "jewelry")
    results.append(check(
        "Rs.800 jewelry, Zurich — normal amount, new country",
        data, "VERIFY",
    ))

    # ── 4: High amount, known location ────────────────────────────────────
    print("--- SCENARIO 4: High Amount at Known Location (Info) -----------")
    clear_vel()
    data = analyze(8000, "New Delhi", "electronics")
    actual = data["decision"]
    risk   = data["risk_score"]
    rule   = round(data["rule_score"] * 100)
    print(f"  [INFO] Rs.8,000 electronics, New Delhi")
    print(f"         Decision : {actual}  Risk: {risk:.1f}  Rule: {rule}")
    print(f"         NOTE: Amount-only flag with no location risk.")
    print(f"         With 20% amount weight, expect ALLOW unless amount is extreme.")
    fb = data.get("feature_breakdown", [])
    for row in fb:
        icons = {"normal": "   ", "elevated": "[!]", "critical": "[X]"}
        icon = icons.get(row["status"], "   ")
        print(f"         {icon} {row['name']:<10} {row['normal']:<22} -> {row['current']}")
    print()
    results.append(True)  # informational

    # ── 5: High amount + new location ─────────────────────────────────────
    print("--- SCENARIO 5: High Amount + New Location ---------------------")
    clear_vel()
    data = analyze(15000, "Zurich, Switzerland", "jewelry")
    results.append(check(
        "Rs.15,000 jewelry, Zurich — 12.5x avg + new location",
        data, "BLOCK",   # location(70%)+amount(20%) rule→90, fused→66+ML→BLOCK
    ))

    # ── 6: Velocity Attack ────────────────────────────────────────────────
    print("--- SCENARIO 6: Velocity Attack (Carding Simulation) -----------")
    clear_vel()
    print("        Injecting 5 rapid transactions into velocity cache...")
    inject_velocity(USER)
    time.sleep(0.3)
    data = analyze(500, "New Delhi", "digital")
    results.append(check(
        "Rs.500 digital, New Delhi AFTER velocity injection",
        data, "BLOCK",
    ))

    # ── 7: Normal transaction after a reset ───────────────────────────────
    print("--- SCENARIO 7: Full Reset -> Baseline (Regression) ------------")
    reset()
    clear_vel()
    data = analyze(400, "Mumbai", "food")
    results.append(check(
        "Rs.400 food, Mumbai — known location, after full reset",
        data, "ALLOW",
    ))

    # ── Summary ───────────────────────────────────────────────────────────
    passed = sum(results)
    total  = len(results)
    failed = total - passed

    print("=" * 65)
    print(f"  Results: {passed}/{total} passed  |  {failed} failed")
    print("=" * 65)

    if failed == 0:
        print("  All scenarios behave as expected.\n")
    else:
        print(f"  {failed} scenario(s) need attention -- see FAIL entries above.\n")


if __name__ == "__main__":
    run_tests()
