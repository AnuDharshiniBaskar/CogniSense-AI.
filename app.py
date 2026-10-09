import hmac
import os
import sqlite3
from datetime import datetime

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), "cognisense.db")

# Host PIN: only the host should know this.
# Set it in Render: Environment > Add Environment Variable
#   Key: COGNISENSE_HOST_PIN   Value: your-secret-pin
HOST_PIN = os.environ.get("COGNISENSE_HOST_PIN", "cognisense-host")
ALLOWED_TASKS = {"Memory", "Attention", "Quiz"}


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


init_db()


def host_authorized():
    supplied = request.headers.get("X-Host-Pin", "")
    return hmac.compare_digest(supplied.encode("utf-8"), HOST_PIN.encode("utf-8"))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/host")
def host_page():
    return render_template("host.html")


@app.route("/api/save", methods=["POST"])
def save_attempt():
    data = request.get_json(silent=True) or {}
    required = ["participant", "task_type", "difficulty", "question_count",
                "correct_count", "accuracy", "avg_response_ms", "workload"]
    if any(k not in data for k in required):
        return jsonify({"error": "Missing required fields."}), 400
    if data["task_type"] not in ALLOWED_TASKS:
        return jsonify({"error": "Unknown task type."}), 400

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
            datetime.now().isoformat(timespec="seconds"),
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
    # Participant names are host-only: this endpoint requires the host PIN.
    if not host_authorized():
        return jsonify({"error": "Host access required."}), 403

    limit = request.args.get("limit", 100, type=int) or 100
    limit = min(max(limit, 1), 500)
    participant = request.args.get("participant", "").strip()[:60]

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        if participant:
            rows = conn.execute("""
                SELECT participant, task_type, difficulty, accuracy, avg_response_ms,
                       workload, created_at
                FROM attempts WHERE participant = ?
                ORDER BY id DESC LIMIT ?
            """, (participant, limit)).fetchall()
        else:
            rows = conn.execute("""
                SELECT participant, task_type, difficulty, accuracy, avg_response_ms,
                       workload, created_at
                FROM attempts ORDER BY id DESC LIMIT ?
            """, (limit,)).fetchall()
    return jsonify([dict(row) for row in rows])


if __name__ == "__main__":
    app.run(debug=True)
