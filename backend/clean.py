import sqlite3
import json

conn = sqlite3.connect('backend/sentinel.db')
c = conn.cursor()
c.execute('SELECT user_id, frequent_locations FROM user_behavior_profiles')
rows = c.fetchall()
count = 0
for user_id, locs_json in rows:
    locs = json.loads(locs_json or '[]')
    if any('zurich' in l.lower() for l in locs):
        locs = [l for l in locs if 'zurich' not in l.lower()]
        c.execute('UPDATE user_behavior_profiles SET frequent_locations=? WHERE user_id=?', (json.dumps(locs), user_id))
        count += 1
conn.commit()
print(f'Cleaned {count} profiles')
