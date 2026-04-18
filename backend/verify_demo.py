import requests
import json
import time

API_URL = "http://localhost:8000/api/v1"

def analyze(payload):
    response = requests.post(f"{API_URL}/analyze-transaction", json=payload)
    return response.json()

print("--- Testing Organic Backend Scenarios ---")

# Stage 1: Control (ALLOW)
print("\n[Stage 1] Control (ALLOW) - Amount: 350, Location: New Delhi")
res1 = analyze({
    "user_id": "demo_rahul",
    "amount": 350,
    "location": "New Delhi",
    "merchant_type": "grocery",
    "merchant_name": "RapidMart"
})
print(f"Decision: {res1.get('decision')} | Risk Score: {res1.get('risk_score')} | Reasons: {res1.get('reasons')}")


# Stage 2: Location Anomaly (VERIFY)
print("\n[Stage 2] Location Anomaly (VERIFY) - Amount: 400, Location: Zurich")
res2 = analyze({
    "user_id": "demo_rahul",
    "amount": 400,
    "location": "Zurich",
    "merchant_type": "jewelry",
    "merchant_name": "Swiss Luxury"
})
print(f"Decision: {res2.get('decision')} | Risk Score: {res2.get('risk_score')} | Reasons: {res2.get('reasons')}")

# Stage 3: Velocity Spike (BLOCK)
print("\n[Stage 3] Velocity Spike (BLOCK)")
# Inject velocity
requests.post(f"{API_URL}/simulate-velocity/demo_rahul")
print("Injected 5 rapid micro-transactions...")
time.sleep(1)
res3 = analyze({
    "user_id": "demo_rahul",
    "amount": 15000,
    "location": "New Delhi",
    "merchant_type": "digital",
    "merchant_name": "Steam"
})
print(f"Decision: {res3.get('decision')} | Risk Score: {res3.get('risk_score')} | Reasons: {res3.get('reasons')}")

# Stage 4: High Amount Override (BLOCK)
print("\n[Stage 4] Massive Amount Override (BLOCK) - Amount: 20000, Location: Mumbai")
res4 = analyze({
    "user_id": "demo_rahul",
    "amount": 20000,
    "location": "Mumbai",
    "merchant_type": "jewelry",
    "merchant_name": "Custom"
})
print(f"Decision: {res4.get('decision')} | Risk Score: {res4.get('risk_score')} | Reasons: {res4.get('reasons')}")
