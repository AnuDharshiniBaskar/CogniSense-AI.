# CogniSense AI — Multi-feature Accessible Mind Lab

A responsive Flask web application for a cognitive science educational project.

## Features
- Overview dashboard and session metrics
- Five interactive games: number sequence, colour focus, word recall, shape memory, pattern grid
- Easy, medium and hard difficulty options
- Focus timer with pause, resume, reset and completion tracking
- Private learning journal with mood selector, saved entries and per-entry deletion
- Progress overview with answer accuracy and performance bars
- High-contrast toggle, keyboard focus states, skip navigation and live announcements
- Responsive desktop/mobile layout and reduced-motion support
- Local-only journal storage using browser localStorage; no account or external analytics

## Run locally
Python 3.10+ recommended.

```bash
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## Deploy to Render
Push this folder's files to your GitHub repository, then create/update a Render Web Service:
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

`render.yaml` is included for optional Blueprint deployment.

## Privacy and scope
Journal entries are stored in browser localStorage on the user's device. They are not uploaded to Flask or shared with a server. Clearing browser site data removes them. Game scores and focus timer statistics are session-only. The app is an educational prototype, not a medical or psychological assessment.

## Scoring and motivation
- Points per correct answer: Easy 10, Medium 15, Hard 25, plus a streak bonus (+5 for each extra correct answer in a row, max +25).
- The score strip under the game shows Score, Streak and Best (best score per difficulty is saved in this browser).
- After every round a message appears: a high-score or streak message for strong results, and an encouraging message after low results.

## Harder rounds
- Hard mode shows the stimulus only briefly (for example, digits for 0.8 s, the colour word for 0.5 s, equations for 1.8 s), then it disappears and you answer from memory.
- Hard number sequences must be entered in reverse order. Hard word recall asks which word was NOT in the list.

## Question variety
- Within one session (until you reset stats) no question repeats: number sequences, colour pairs, word lists, shape and colour combinations, maths problems, pattern puzzles, odd-one-out sets and grid patterns are tracked.
- Number sequences use different digits inside each sequence.
- Word bank has about 170 words, 8 colours, 8 shapes and 18 odd-one-out sets.

## Reaction time game
- Wait for the signal, then tap the GREEN box as fast as you can. Red is a trap: do not tap it.
- Tapping before the signal loses the round. Hard mode has shorter waits, more red signals and a shorter time window.

## Host dashboard
- Open `/host` on the server (for example http://127.0.0.1:5000/host). Enter the host PIN.
- Every completed round is saved with the player's nickname (or "Guest"), game, difficulty, result and points.
- The host sees names only on this page. Players never see other players' results.
- Set the PIN before running: `COGNISENSE_HOST_PIN=your-secret` (Windows cmd: `set COGNISENSE_HOST_PIN=your-secret`). Default is `cognisense-host`.
- Results are stored in `cognisense.db`. On Render, set `COGNISENSE_DATA_DIR` to a persistent disk path to keep them after restarts.
- The host page does not show dates.
