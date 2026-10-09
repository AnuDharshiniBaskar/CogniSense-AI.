# CogniSense AI: cognitive science quiz with host dashboard

Player website (name, memory / attention / quiz rounds, answer reveal, 15s quiz timer)
and a host-only dashboard that shows who played and their results.

## Pages
- Player: `/`
- Host: `/host` (needs the host PIN). Player names are visible only here.

## Run on Windows
1. Extract the zip and open the `CogniSense_Backend` folder in VS Code.
2. `py -m venv .venv` then `.venv\Scripts\activate`
3. `py -m pip install -r requirements.txt`
4. Set the host PIN: `set COGNISENSE_HOST_PIN=your-secret` (cmd) or `$env:COGNISENSE_HOST_PIN="your-secret"` (PowerShell)
5. `py app.py` and open `http://127.0.0.1:5000`

## Deploy on Render
1. Push this folder to a GitHub repository (Render deploys from GitHub).
2. Render > New > Blueprint (or Web Service), pick the repository. `render.yaml` sets the build and start commands.
3. When asked, enter `COGNISENSE_HOST_PIN` (your secret host PIN).
4. Optional, for permanent results: add a Render Disk mounted at `/data` and set `COGNISENSE_DATA_DIR=/data`. Without a disk, results reset when the service restarts.

## Note
The workload estimate is a demonstration heuristic, not a validated cognitive-load model.

## Structure
```
CogniSense_Backend/
├── app.py
├── render.yaml
├── requirements.txt
├── .gitignore
├── README.md
├── templates/  index.html, host.html
└── static/     app.js, style.css
```
