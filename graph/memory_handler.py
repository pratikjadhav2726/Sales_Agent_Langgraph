import sqlite3
from datetime import datetime

class MemoryHandler:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self._init_db()

    def _init_db(self):
        self.cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS memory (
                user_id TEXT,
                message TEXT,
                timestamp DATETIME
            )
            '''
        )
        self.conn.commit()

    def get_memory(self, user_id: str) -> str:
        self.cursor.execute(
            "SELECT message FROM memory WHERE user_id = ? ORDER BY timestamp",
            (user_id,)
        )
        rows = self.cursor.fetchall()
        return "\n".join(row[0] for row in rows)

    def save_memory(self, user_id: str, message: str):
        self.cursor.execute(
            "INSERT INTO memory (user_id, message, timestamp) VALUES (?, ?, ?)" ,
            (user_id, message, datetime.utcnow())
        )
        self.conn.commit()