import sqlite3
import json
from datetime import datetime
import os

DB_PATH = "sentinel_audit.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            person_id TEXT,
            signature TEXT,
            risk_score REAL,
            decision TEXT,
            rationale TEXT,
            frame_preview TEXT,
            is_verified INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def log_event(person_id, signature, risk_score, decision, rationale):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO audit_logs (person_id, signature, risk_score, decision, rationale)
        VALUES (?, ?, ?, ?, ?)
    ''', (person_id, signature, risk_score, decision, rationale))
    conn.commit()
    conn.close()

def verify_log(log_id, correct):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE audit_logs SET is_verified = ? WHERE id = ?', (1 if correct else -1, log_id))
    conn.commit()
    conn.close()

def get_recent_logs(limit=20):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?', (limit,))
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs

init_db()
