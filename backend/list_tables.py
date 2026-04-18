import sqlite3
c = sqlite3.connect('sentinel.db').cursor()
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print(tables)
