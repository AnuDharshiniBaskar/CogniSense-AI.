const form = document.getElementById('setup-form');
const taskContent = document.getElementById('task-content');
const taskTitle = document.getElementById('task-title');
const feedback = document.getElementById('feedback');
const resultsSection = document.getElementById('results');

let session = null;
let questionStartedAt = 0;
let revealTimer = null;

const memoryQuestions = {
  Easy: [
    {prompt: "Remember this sequence, then choose it from the options.", sequence: "3 8 1", answer: "3 8 1", options: ["3 8 1", "3 1 8", "8 3 1", "1 8 3"]},
    {prompt: "Which sequence did you see?", sequence: "6 2 9", answer: "6 2 9", options: ["6 9 2", "6 2 9", "2 6 9", "9 2 6"]},
    {prompt: "Choose the sequence you remember.", sequence: "4 7 5", answer: "4 7 5", options: ["7 4 5", "5 7 4", "4 7 5", "4 5 7"]}
  ],
  Moderate: [
    {prompt: "Remember this sequence, then choose it from the options.", sequence: "7 2 9 4", answer: "7 2 9 4", options: ["7 9 2 4", "7 2 9 4", "2 7 4 9", "4 9 2 7"]},
    {prompt: "Which sequence did you see?", sequence: "5 1 8 3", answer: "5 1 8 3", options: ["5 8 1 3", "1 5 8 3", "5 1 8 3", "3 8 1 5"]},
    {prompt: "Choose the sequence you remember.", sequence: "9 4 6 2", answer: "9 4 6 2", options: ["9 4 2 6", "4 9 6 2", "2 6 4 9", "9 4 6 2"]}
  ],
  Hard: [
    {prompt: "Remember this sequence, then choose it from the options.", sequence: "8 3 1 7 5", answer: "8 3 1 7 5", options: ["8 1 3 7 5", "8 3 1 7 5", "5 7 1 3 8", "8 3 7 1 5"]},
    {prompt: "Which sequence did you see?", sequence: "2 9 4 6 1", answer: "2 9 4 6 1", options: ["2 9 6 4 1", "9 2 4 6 1", "2 9 4 6 1", "1 6 4 9 2"]},
    {prompt: "Choose the sequence you remember.", sequence: "6 1 8 3 9", answer: "6 1 8 3 9", options: ["6 1 3 8 9", "9 3 8 1 6", "6 1 8 3 9", "6 8 1 3 9"]}
  ]
};
const attentionQuestions = [
  {prompt:"Select the word that matches the target: target = BLUE", options:["BLUE","GREEN","RED","YELLOW"], answer:"BLUE"},
  {prompt:"Select the word that matches the target: target = GREEN", options:["RED","BLUE","GREEN","YELLOW"], answer:"GREEN"},
  {prompt:"Select the word that matches the target: target = RED", options:["YELLOW","GREEN","BLUE","RED"], answer:"RED"},
  {prompt:"Select the word that matches the target: target = YELLOW", options:["GREEN","YELLOW","RED","BLUE"], answer:"YELLOW"},
  {prompt:"Select the word that matches the target: target = BLUE", options:["GREEN","RED","BLUE","YELLOW"], answer:"BLUE"}
];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(revealTimer);
  const taskType = document.getElementById('task-type').value;
  const difficulty = document.getElementById('difficulty').value;
  session = {
    participant: document.getElementById('participant').value.trim() || 'Guest',
    taskType, difficulty, current: 0, correct: 0, times: [],
    questions: taskType === 'Memory'
      ? shuffle(memoryQuestions[difficulty]).map(q => ({...q, options: shuffle(q.options)}))
      : shuffle(attentionQuestions).map(q => ({...q, options: shuffle(q.options)}))
  };
  resultsSection.hidden = true;
  feedback.textContent = '';
  feedback.className = 'feedback';
  taskTitle.textContent = taskType === 'Memory' ? 'Memory recall' : 'Selective attention';
  document.getElementById('task-panel').scrollIntoView({behavior:'smooth', block:'start'});
  showQuestion();
});

function showQuestion() {
  if (!session || session.current >= session.questions.length) {
    finishSession();
    return;
  }
  const q = session.questions[session.current];
  feedback.textContent = '';
  feedback.className = 'feedback';
  taskContent.className = 'task-content';
  const sequence = session.taskType === 'Memory'
    ? `<div class="sequence" id="sequence">${q.sequence}</div><p class="task-hint" id="memory-hint">Memorize the sequence. It will hide in a moment.</p>`
    : `<div class="sequence" style="font-size:20px;letter-spacing:1px">ATTENTION</div>`;
  taskContent.innerHTML = `
    <div class="question-number">QUESTION ${session.current + 1} OF ${session.questions.length}</div>
    <p class="question-text">${q.prompt}</p>
    ${sequence}
    <div class="options" id="options"></div>`;
  const options = document.getElementById('options');
  q.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => answerQuestion(option, btn));
    options.appendChild(btn);
  });
  if (session.taskType === 'Memory') {
    const buttons = [...options.querySelectorAll('button')];
    buttons.forEach(b => b.disabled = true);
    revealTimer = setTimeout(() => {
      const seq = document.getElementById('sequence');
      if (seq) seq.textContent = '•••';
      const hint = document.getElementById('memory-hint');
      if (hint) hint.textContent = 'Now choose the sequence you remember.';
      buttons.forEach(b => b.disabled = false);
      questionStartedAt = performance.now();
    }, 1800);
  } else {
    questionStartedAt = performance.now();
  }
}

function answerQuestion(answer, clickedButton) {
  if (!session || clickedButton.disabled) return;
  const elapsed = Math.max(1, Math.round(performance.now() - questionStartedAt));
  session.times.push(elapsed);
  const q = session.questions[session.current];
  const correct = answer === q.answer;
  if (correct) session.correct++;
  document.querySelectorAll('#options button').forEach(b => b.disabled = true);
  feedback.textContent = correct ? 'Correct — well done!' : `Not quite. Correct answer: ${q.answer}`;
  feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
  session.current++;
  setTimeout(showQuestion, 850);
}

function estimateWorkload(accuracy, avgTime) {
  // Transparent demo heuristic only; not a validated cognitive-load model.
  let points = 0;
  if (accuracy < 60) points += 2;
  else if (accuracy < 80) points += 1;
  if (avgTime > 6000) points += 2;
  else if (avgTime > 3500) points += 1;
  if (points >= 3) return 'High';
  if (points >= 1) return 'Moderate';
  return 'Low';
}

function finishSession() {
  const accuracy = Math.round((session.correct / session.questions.length) * 100);
  const avgTime = Math.round(session.times.reduce((a,b) => a+b, 0) / Math.max(session.times.length, 1));
  const workload = estimateWorkload(accuracy, avgTime);
  document.getElementById('result-accuracy').textContent = `${accuracy}%`;
  document.getElementById('accuracy-bar').style.width = `${accuracy}%`;
  document.getElementById('result-time').textContent = `${(avgTime / 1000).toFixed(2)}s`;
  document.getElementById('result-workload').textContent = workload;
  const descriptions = {
    Low: 'Fast and accurate in this task',
    Moderate: 'Mixed performance indicators',
    High: 'More errors and/or slower responses'
  };
  document.getElementById('result-description').textContent = descriptions[workload];
  const suggestions = {
    Low: 'Try a harder level or a different task to keep practising. This result describes only this short session.',
    Moderate: 'Repeat the task once, take your time, and compare the next session with this one.',
    High: 'Consider trying an easier level, reducing distractions, and taking a short break before another attempt.'
  };
  document.getElementById('suggestion').textContent = suggestions[workload];
  resultsSection.hidden = false;
  taskTitle.textContent = 'Assessment complete';
  taskContent.className = 'task-content empty-state';
  taskContent.innerHTML = `<div class="empty-illustration">✓</div><h3>Session completed</h3><p>You answered ${session.correct} of ${session.questions.length} questions correctly. Your summary is ready below.</p>`;
  feedback.textContent = 'Your session summary has been generated.';
  feedback.className = 'feedback good';
  resultsSection.scrollIntoView({behavior:'smooth', block:'start'});
  fetch('/api/save', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      participant: session.participant, task_type: session.taskType,
      difficulty: session.difficulty, question_count: session.questions.length,
      correct_count: session.correct, accuracy, avg_response_ms: avgTime, workload
    })
  }).then(() => loadHistory()).catch(() => {});
}

async function loadHistory() {
  const body = document.getElementById('history-body');
  try {
    const response = await fetch('/api/history');
    const rows = await response.json();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-table">No saved sessions yet. Complete an assessment to see your results.</td></tr>';
      return;
    }
    body.innerHTML = rows.map(row => `<tr>
      <td>${escapeHtml(row.participant)}</td><td>${escapeHtml(row.task_type)}</td>
      <td>${escapeHtml(row.difficulty)}</td><td>${Math.round(Number(row.accuracy))}%</td>
      <td>${(Number(row.avg_response_ms)/1000).toFixed(2)}s</td>
      <td><span class="workload-badge">${escapeHtml(row.workload)}</span></td>
    </tr>`).join('');
  } catch {
    body.innerHTML = '<tr><td colspan="6" class="empty-table">Could not load history. Is the Flask server running?</td></tr>';
  }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
document.getElementById('refresh-history').addEventListener('click', loadHistory);
document.getElementById('new-session').addEventListener('click', () => {
  document.getElementById('assessment').scrollIntoView({behavior:'smooth'});
  resultsSection.hidden = true;
});
loadHistory();
