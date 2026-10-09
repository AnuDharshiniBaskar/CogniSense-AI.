const $ = (id) => document.getElementById(id);
const form = $('setup-form');
const taskContent = $('task-content');
const taskTitle = $('task-title');
const feedback = $('feedback');
const resultsSection = $('results');

const SESSION_LENGTH = 8;   // Memory and Attention rounds
const QUIZ_LENGTH = 10;     // quiz rounds
const QUIZ_SECONDS = 15;
const MEMORY_LENGTH = { Easy: 3, Moderate: 4, Hard: 5 };
const ATTENTION_OPTIONS = { Easy: 3, Moderate: 4, Hard: 5 };
const REVEAL_DELAY_MS = 1800;

const COLORS = [
  { name: 'BLUE', hex: '#3b82f6' }, { name: 'GREEN', hex: '#22c55e' },
  { name: 'RED', hex: '#ef4444' }, { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' }, { name: 'ORANGE', hex: '#f97316' }
];

const QUIZ_BANK = [
  { prompt: "Which memory system can hold only about 4 chunks of information at once?", options: ["Sensory memory", "Working memory", "Long-term memory", "Procedural memory"], answer: "Working memory" },
  { prompt: "Cognitive load theory was developed mainly by which researcher?", options: ["Ivan Pavlov", "John Sweller", "B. F. Skinner", "Jean Piaget"], answer: "John Sweller" },
  { prompt: "The Stroop effect shows interference between which two things?", options: ["Sight and sound", "Word meaning and ink colour", "Short and long-term memory", "Speed and accuracy"], answer: "Word meaning and ink colour" },
  { prompt: "Selective attention means:", options: ["Remembering everything equally well", "Focusing on relevant stimuli while ignoring others", "Doing two tasks at full effort", "Sleeping while learning"], answer: "Focusing on relevant stimuli while ignoring others" },
  { prompt: "Which term describes thinking about your own thinking?", options: ["Metacognition", "Heuristic", "Conditioning", "Schema"], answer: "Metacognition" },
  { prompt: "Chunking helps memory mainly by:", options: ["Grouping items into meaningful units", "Repeating items without meaning", "Slowing down the presentation only", "Removing all distractions"], answer: "Grouping items into meaningful units" },
  { prompt: "The cocktail party effect is best described as:", options: ["Hearing your own name in a noisy room", "Tasting two drinks at once", "Seeing colours in darkness", "Remembering a dream"], answer: "Hearing your own name in a noisy room" },
  { prompt: "Reaction time usually gets slower when:", options: ["Only one response is possible", "A task requires a choice among many options", "The stimulus is very bright", "You already know the answer"], answer: "A task requires a choice among many options" },
  { prompt: "A schema is best described as:", options: ["A mental framework that organises knowledge", "A type of brain scan", "A memory of a single event", "A learned reflex"], answer: "A mental framework that organises knowledge" },
  { prompt: "Which brain region is most strongly linked to forming new long-term declarative memories?", options: ["Hippocampus", "Cerebellum", "Medulla", "Occipital lobe"], answer: "Hippocampus" },
  { prompt: "Dual-task interference is most likely when two tasks:", options: ["Compete for the same mental resources", "Are performed by different people", "Are both fully automatic and unrelated", "Use no attention at all"], answer: "Compete for the same mental resources" },
  { prompt: "Recognition is usually easier than recall because:", options: ["Recognition provides retrieval cues", "Recall uses less memory", "Recognition needs no memory", "Recall is always faster"], answer: "Recognition provides retrieval cues" },
  { prompt: "The 'tip-of-the-tongue' experience is an example of:", options: ["A retrieval failure", "Permanent forgetting", "Sensory overload", "Priming"], answer: "A retrieval failure" },
  { prompt: "Which process runs with little conscious effort after lots of practice?", options: ["Controlled processing", "Automatic processing", "Deliberate rehearsal", "Working recall"], answer: "Automatic processing" },
  { prompt: "The serial position effect means items are best recalled from:", options: ["The beginning and end of a list", "The middle of a list only", "Random positions", "The last item only"], answer: "The beginning and end of a list" },
  { prompt: "Confirmation bias is:", options: ["Favouring information that supports existing beliefs", "Believing everything you read", "Ignoring your own memories", "Trusting only experts"], answer: "Favouring information that supports existing beliefs" },
  { prompt: "Which tool is a subjective self-report of mental workload?", options: ["NASA-TLX", "EEG", "fMRI", "Heart rate variability"], answer: "NASA-TLX" },
  { prompt: "Priming occurs when:", options: ["Exposure to one stimulus influences the response to another", "A memory is permanently erased", "Attention is fully divided", "A reflex is trained"], answer: "Exposure to one stimulus influences the response to another" },
  { prompt: "Which is an example of semantic memory?", options: ["Knowing that Paris is the capital of France", "Remembering your last birthday party", "Riding a bicycle", "Recalling a childhood smell"], answer: "Knowing that Paris is the capital of France" },
  { prompt: "Working memory is most often associated with which model?", options: ["Baddeley and Hitch", "Freud's id model", "Piaget's stage theory", "Pavlov's conditioning"], answer: "Baddeley and Hitch" }
];

let session = null;
let nextTimer = null;
let memoryTimer = null;
let countdownId = null;
let startedAt = 0;
let locked = false;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const randInt = (n) => Math.floor(Math.random() * n);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function makeMemoryQuestion(difficulty) {
  const n = MEMORY_LENGTH[difficulty];
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n);
  const answer = digits.join(' ');
  const options = new Set([answer]);
  for (let guard = 0; options.size < 4 && guard < 500; guard++) {
    const arr = [...digits];
    const i = randInt(n), j = randInt(n);
    [arr[i], arr[j]] = [arr[j], arr[i]];
    options.add(arr.join(' '));
  }
  return { type: 'memory', prompt: 'Remember this sequence, then choose it from the options.',
           sequence: answer, answer, options: shuffle([...options]) };
}

function makeAttentionQuestion(difficulty) {
  const word = pick(COLORS);
  let ink;
  do { ink = pick(COLORS); } while (ink.name === word.name);
  const distractors = shuffle(COLORS.filter(c => c.name !== ink.name))
    .slice(0, ATTENTION_OPTIONS[difficulty] - 1).map(c => c.name);
  return { type: 'attention', prompt: 'Ignore the word. Click the INK colour it is written in.',
           word: word.name, inkHex: ink.hex, answer: ink.name, options: shuffle([ink.name, ...distractors]) };
}

function buildQuestions(taskType, difficulty) {
  if (taskType === 'Memory') return Array.from({ length: SESSION_LENGTH }, () => makeMemoryQuestion(difficulty));
  if (taskType === 'Attention') return Array.from({ length: SESSION_LENGTH }, () => makeAttentionQuestion(difficulty));
  return shuffle(QUIZ_BANK).slice(0, QUIZ_LENGTH)
    .map(q => ({ type: 'quiz', prompt: q.prompt, answer: q.answer, options: shuffle(q.options) }));
}

function clearTimers() {
  clearTimeout(nextTimer);
  clearTimeout(memoryTimer);
  clearInterval(countdownId);
}

function setOptionsEnabled(enabled) {
  document.querySelectorAll('#options button').forEach(b => b.disabled = !enabled);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimers();
  const taskType = $('task-type').value;
  const difficulty = $('difficulty').value;
  session = {
    participant: $('participant').value.trim() || 'Guest',
    taskType, difficulty, current: 0, correct: 0, times: [],
    questions: buildQuestions(taskType, difficulty)
  };
  resultsSection.hidden = true;
  feedback.textContent = '';
  feedback.className = 'feedback';
  taskTitle.textContent = { Memory: 'Memory recall', Attention: 'Attention (Stroop)', Quiz: 'Cognitive science quiz' }[taskType];
  $('task-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderQuestion();
});

function renderQuestion() {
  clearTimers();
  if (!session) return;
  if (session.current >= session.questions.length) return finishSession();

  const q = session.questions[session.current];
  const total = session.questions.length;
  locked = false;
  feedback.textContent = '';
  feedback.className = 'feedback';
  taskContent.className = 'task-content';

  let stage = '';
  if (q.type === 'memory') {
    stage = `<div class="sequence" id="sequence">${q.sequence}</div>
             <p class="task-hint" id="stage-hint">Memorize the sequence. It will hide in a moment.</p>`;
  } else if (q.type === 'attention') {
    stage = `<div class="sequence" style="color:${q.inkHex};letter-spacing:2px">${q.word}</div>`;
  } else {
    stage = `<div class="timer-wrap"><div class="timer-bar" id="timer-bar"></div></div>
             <p class="task-hint" id="timer-text">${QUIZ_SECONDS}s left</p>`;
  }

  taskContent.innerHTML = `
    <div class="question-number">QUESTION ${session.current + 1} OF ${total}</div>
    <p class="question-text">${escapeHtml(q.prompt)}</p>
    ${stage}
    <div class="options" id="options"></div>`;

  const box = $('options');
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.dataset.value = opt;
    btn.addEventListener('click', () => answer(opt));
    box.appendChild(btn);
  });

  if (q.type === 'memory') {
    setOptionsEnabled(false);
    memoryTimer = setTimeout(() => {
      $('sequence').textContent = '•••';
      $('stage-hint').textContent = 'Now choose the sequence you remember.';
      setOptionsEnabled(true);
      startedAt = performance.now();
    }, REVEAL_DELAY_MS);
  } else if (q.type === 'quiz') {
    startCountdown();
  } else {
    startedAt = performance.now();
  }
}

function startCountdown() {
  const steps = QUIZ_SECONDS * 10;
  let left = steps;
  startedAt = performance.now();
  countdownId = setInterval(() => {
    left--;
    const bar = $('timer-bar');
    const txt = $('timer-text');
    if (bar) bar.style.width = `${(left / steps) * 100}%`;
    if (txt) txt.textContent = `${Math.max(0, Math.ceil(left / 10))}s left`;
    if (left <= 0) answer(null);
  }, 100);
}

function answer(value) {
  if (!session || locked) return;
  locked = true;
  clearTimers();

  const q = session.questions[session.current];
  const elapsed = value === null ? QUIZ_SECONDS * 1000 : Math.max(1, Math.round(performance.now() - startedAt));
  session.times.push(elapsed);
  const correct = value === q.answer;
  if (correct) session.correct++;

  // Reveal the correct answer right after the player answers.
  document.querySelectorAll('#options button').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.value === q.answer) btn.classList.add('correct');
    else if (btn.dataset.value === value) btn.classList.add('wrong');
  });
  if (q.type === 'memory') {
    const seq = $('sequence');
    if (seq) seq.textContent = q.sequence;
  }

  if (value === null) {
    feedback.textContent = `Time's up. Correct answer: ${q.answer}`;
    feedback.className = 'feedback bad';
  } else {
    feedback.textContent = correct ? 'Correct — well done!' : `Not quite. Correct answer: ${q.answer}`;
    feedback.className = `feedback ${correct ? 'good' : 'bad'}`;
  }

  session.current++;
  nextTimer = setTimeout(renderQuestion, 2000);
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
  const s = session;
  session = null;
  const total = s.questions.length;
  const accuracy = Math.round((s.correct / total) * 100);
  const avgTime = Math.round(s.times.reduce((a, b) => a + b, 0) / Math.max(s.times.length, 1));
  const workload = estimateWorkload(accuracy, avgTime);

  $('result-accuracy').textContent = `${accuracy}%`;
  $('accuracy-bar').style.width = `${accuracy}%`;
  $('result-time').textContent = `${(avgTime / 1000).toFixed(2)}s`;
  $('result-workload').textContent = workload;
  $('result-description').textContent = {
    Low: 'Fast and accurate in this task',
    Moderate: 'Mixed performance indicators',
    High: 'More errors and/or slower responses'
  }[workload];
  $('suggestion').textContent = {
    Low: 'Try a harder level or a different task to keep practising. This result describes only this short session.',
    Moderate: 'Repeat the task once, take your time, and compare the next session with this one.',
    High: 'Consider trying an easier level, reducing distractions, and taking a short break before another attempt.'
  }[workload];

  resultsSection.hidden = false;
  taskTitle.textContent = 'Round complete';
  taskContent.className = 'task-content empty-state';
  taskContent.innerHTML = `<div class="empty-illustration">✓</div><h3>Session completed</h3>
    <p>You answered ${s.correct} of ${total} questions correctly. Your summary is ready below.</p>`;
  feedback.textContent = 'Your session summary has been generated.';
  feedback.className = 'feedback good';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participant: s.participant, task_type: s.taskType, difficulty: s.difficulty,
      question_count: total, correct_count: s.correct, accuracy,
      avg_response_ms: avgTime, workload
    })
  }).catch(() => {});
}

$('new-session').addEventListener('click', () => {
  clearTimers();
  session = null;
  resultsSection.hidden = true;
  $('assessment').scrollIntoView({ behavior: 'smooth' });
});
