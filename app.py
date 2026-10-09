from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "cognisense.db")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                participant TEXT NOT NULL,
                task_type TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                question_count INTEGER NOT NULL,
                correct_count INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                avg_response_ms REAL NOT NULL,
                workload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/save", methods=["POST"])
def save_attempt():
    data = request.get_json(silent=True) or {}
    required = ["participant", "task_type", "difficulty", "question_count",
                "correct_count", "accuracy", "avg_response_ms", "workload"]
    if any(k not in data for k in required):
        return jsonify({"error": "Missing required fields."}), 400

    try:
        row = (
            str(data["participant"]).strip()[:60] or "Guest",
            str(data["task_type"])[:40],
            str(data["difficulty"])[:20],
            int(data["question_count"]),
            int(data["correct_count"]),
            float(data["accuracy"]),
            float(data["avg_response_ms"]),
            str(data["workload"])[:20],
            datetime.now().isoformat(timespec="seconds")
        )
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                INSERT INTO attempts
                (participant, task_type, difficulty, question_count, correct_count,
                 accuracy, avg_response_ms, workload, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, row)
            conn.commit()
        return jsonify({"ok": True})
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid result data."}), 400

@app.route("/api/history")
def history():
    participant = request.args.get("participant", "").strip()[:60]
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        if participant:
            rows = conn.execute("""
                SELECT participant, task_type, difficulty, accuracy, avg_response_ms,
                       workload, created_at
                FROM attempts WHERE participant = ?
                ORDER BY id DESC LIMIT 10
            """, (participant,)).fetchall()
        else:
            rows = conn.execute("""
                SELECT participant, task_type, difficulty, accuracy, avg_response_ms,
                       workload, created_at
                FROM attempts ORDER BY id DESC LIMIT 10
            """).fetchall()
    return jsonify([dict(row) for row in rows])

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
