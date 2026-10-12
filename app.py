import hmac
import os
import sqlite3

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Results are stored in SQLite. On Render with a persistent disk, set COGNISENSE_DATA_DIR to the mount path.
DATA_DIR = os.environ.get("COGNISENSE_DATA_DIR", os.path.dirname(os.path.abspath(__file__)))
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "cognisense.db")

# Host PIN: set COGNISENSE_HOST_PIN in the environment. Only the host should know it.
HOST_PIN = os.environ.get("COGNISENSE_HOST_PIN", "cognisense-host")

GAMES = {"sequence", "stroop", "words", "shape", "grid", "math", "oddone", "sequencepattern", "react"}
DIFFICULTIES = {"easy", "medium", "hard"}


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                participant TEXT NOT NULL,
                game TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                correct INTEGER NOT NULL,
                points INTEGER NOT NULL,
                detail TEXT NOT NULL
            )
        """)
        conn.commit()


init_db()


def host_authorized():
    supplied = request.headers.get("X-Host-Pin", "")
    return hmac.compare_digest(supplied.encode("utf-8"), HOST_PIN.encode("utf-8"))


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/host")
def host_page():
    return render_template("host.html")


@app.get("/health")
def health():
    return {"status": "ok", "app": "CogniSense AI"}


@app.post("/api/save")
def save_result():
    data = request.get_json(silent=True) or {}
    try:
        participant = str(data.get("participant", "")).strip()[:24] or "Guest"
        game = str(data.get("game", ""))
        difficulty = str(data.get("difficulty", ""))
        correct = 1 if int(data.get("correct", 0)) else 0
        points = max(0, min(999, int(data.get("points", 0))))
        detail = str(data.get("detail", ""))[:200]
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid result data."}), 400
    if game not in GAMES or difficulty not in DIFFICULTIES:
        return jsonify({"error": "Unknown game or difficulty."}), 400
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO results (participant, game, difficulty, correct, points, detail) VALUES (?, ?, ?, ?, ?, ?)",
            (participant, game, difficulty, correct, points, detail),
        )
        conn.commit()
    return jsonify({"ok": True})


@app.get("/api/history")
def history():
    # Player names are host-only.
    if not host_authorized():
        return jsonify({"error": "Host access required."}), 403
    limit = min(max(request.args.get("limit", 300, type=int) or 300, 1), 1000)
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT participant, game, difficulty, correct, points, detail FROM results ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    # host 0.0.0.0 lets other devices on the same Wi-Fi open the app. Use FLASK_DEBUG=1 only while developing.
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
