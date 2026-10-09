# CogniSense AI — Cognitive Science Mini Project

A small educational web application exploring the relationship between cognitive task difficulty, response time, and answer accuracy. It includes memory-recall and selective-attention tasks, a performance dashboard, adaptive practice suggestions, and a local SQLite session history.

## Features
- Memory recall assessment with easy, moderate, and hard levels
- Selective attention multiple-choice task
- Measures response time and answer accuracy
- Transparent, rule-based workload estimate (low / moderate / high)
- Practice suggestions based on session results
- Flask backend and SQLite session history
- Responsive dashboard built with HTML, CSS, and JavaScript

## Important scientific limitation
The workload category is a **demonstration heuristic**, not a trained or scientifically validated AI/ML model. Response time and accuracy alone cannot establish a person's actual cognitive load or diagnose any condition. If this is used for academic research, collect consented experimental data, use a validated self-report measure such as NASA-TLX where appropriate, and evaluate any model against suitable labels.

## Requirements
- Python 3.9+
- pip

## Run on Windows
1. Extract `CogniSense_AI.zip`.
2. Open the extracted `CogniSense_AI` folder in VS Code.
3. Open Terminal in VS Code.
4. Create a virtual environment (recommended):

   ```bash
   py -m venv .venv
   .venv\\Scripts\\activate
   ```

5. Install dependencies:

   ```bash
   py -m pip install -r requirements.txt
   ```

6. Start the app:

   ```bash
   py app.py
   ```

7. Open the local address shown in the terminal, usually `http://127.0.0.1:5000`.

The SQLite database `cognisense.db` is created automatically the first time the app runs.

## Project structure
```text
CogniSense_AI/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── app.js
    └── style.css
```

## Suggested mini-project report sections
1. Abstract
2. Introduction to cognitive load and human information processing
3. Problem statement
4. Objectives
5. Existing system and proposed system
6. System architecture
7. Modules
8. Software and hardware requirements
9. Implementation
10. Testing and sample outputs
11. Limitations and future enhancements
12. Conclusion
