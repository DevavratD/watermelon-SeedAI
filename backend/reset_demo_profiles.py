"""
reset_demo_profiles.py
Resets demo user profiles to clean, realistic baselines for demo purposes.
Run with: python reset_demo_profiles.py
"""
import sqlite3
import json
from datetime import datetime

# Realistic demo profiles
DEMO_PROFILES = {
    "demo_rahul": {
        "avg_amount": 1200.0,
        "std_amount": 350.0,
        "transaction_count": 12,
        "frequent_locations": json.dumps(["New Delhi", "Mumbai"]),
        "active_hours": json.dumps([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),  # IST 9AM-7PM in UTC
        "baseline_hourly_rate": 2.0,  # 2 txns/hr is normal, so 1 txn won't spike
    },
    "demo_amit": {
        "avg_amount": 800.0,
        "std_amount": 200.0,
        "transaction_count": 8,
        "frequent_locations": json.dumps(["Mumbai", "Pune"]),
        "active_hours": json.dumps([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
        "baseline_hourly_rate": 2.0,
    },
    "demo_mehta": {
        "avg_amount": 2500.0,
        "std_amount": 600.0,
        "transaction_count": 20,
        "frequent_locations": json.dumps(["New Delhi", "Bengaluru"]),
        "active_hours": json.dumps([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
        "baseline_hourly_rate": 2.0,
    },
    "demo_sarah": {
        "avg_amount": 500.0,
        "std_amount": 150.0,
        "transaction_count": 6,
        "frequent_locations": json.dumps(["Bangalore"]),
        "active_hours": json.dumps([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
        "baseline_hourly_rate": 2.0,
    },
}

conn = sqlite3.connect("sentinel.db")
c = conn.cursor()
now = datetime.utcnow().isoformat()
count = 0
for user_id, data in DEMO_PROFILES.items():
    c.execute("""
        UPDATE user_behavior_profiles SET
            avg_amount=?,
            std_amount=?,
            transaction_count=?,
            frequent_locations=?,
            active_hours=?,
            baseline_hourly_rate=?,
            last_updated=?
        WHERE user_id=?
    """, (
        data["avg_amount"],
        data["std_amount"],
        data["transaction_count"],
        data["frequent_locations"],
        data["active_hours"],
        data["baseline_hourly_rate"],
        now,
        user_id
    ))
    if c.rowcount > 0:
        count += 1
        print(f"  [OK] Reset {user_id}: avg={data['avg_amount']}, locations={data['frequent_locations']}")
    else:
        print(f"  [SKIP] {user_id} not found in DB")

conn.commit()
conn.close()
print(f"\nDone: {count} profiles reset")
