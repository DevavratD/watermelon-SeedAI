"""
app/db/cache.py
────────────────
In-Memory Cache (Redis Simulator)
Provides O(1) velocity lookups without hitting the SQLite database.
Ready to be swapped out for a true Redis client (`redis-py`) in production.
"""
from datetime import datetime, timedelta
import threading

class VelocityCache:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(VelocityCache, cls).__new__(cls)
                cls._instance.store = {}
            return cls._instance

    def increment(self, user_id: str, window_minutes: int = 60) -> int:
        """
        Record a transaction for a user and return the count in the window.
        """
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=window_minutes)
        
        # Initialize
        if user_id not in self.store:
            self.store[user_id] = []
            
        # Filter old transactions
        self.store[user_id] = [t for t in self.store[user_id] if t > cutoff]
        
        # Add new and return count
        self.store[user_id].append(now)
        return len(self.store[user_id])
        
    def get_velocity(self, user_id: str, window_minutes: int = 60) -> int:
        """
        Get the current velocity without incrementing.
        """
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=window_minutes)
        
        if user_id not in self.store:
            return 0
            
        self.store[user_id] = [t for t in self.store[user_id] if t > cutoff]
        return len(self.store[user_id])

rcache = VelocityCache()
