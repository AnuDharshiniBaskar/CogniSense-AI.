
(() => {
  const SESSION_LENGTH = 8;
  const QUIZ_LENGTH = 10;
  const QUIZ_SECONDS = 15;
  const MEMORY_LENGTH = { Easy: 3, Moderate: 4, Hard: 5 };
  const ATTENTION_OPTIONS = { Easy: 3, Moderate: 4, Hard: 5 };
  const REVEAL_MS = 1800;
  const NEXT_MS = 1800;

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

  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  let task = 'Memory';
  let session = null;
  let timers = [];
  let countdown = null;
  let startedAt = 0;
  let locked = false;

  const shuffle = (arr) => {
    const r = [...arr];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (n) => Math.floor(Math.random() * n);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(countdown);
    countdown = null;
  }

  function makeMemory(diff) {
    const n = MEMORY_LENGTH[diff];
    const digits = shuffle([1,2,3,4,5,6,7,8,9]).slice(0, n);
    const answer = digits.join(' ');
    const opts = new Set([answer]);
    for (let g = 0; opts.size < 4 && g < 500; g++) {
      const a = [...digits];
      const i = randInt(n), j = randInt(n);
      [a[i], a[j]] = [a[j], a[i]];
      opts.add(a.join(' '));
    }
    return { type: 'memory', prompt: 'Remember the sequence, then choose it.', sequence: answer, answer, options: shuffle([...opts]) };
  }

  function makeAttention(diff) {
    const word = pick(COLORS);
    let ink;
    do { ink = pick(COLORS); } while (ink.name === word.name);
    const others = shuffle(COLORS.filter(c => c.name !== ink.name)).slice(0, ATTENTION_OPTIONS[diff] - 1).map(c => c.name);
    return { type: 'attention', prompt: 'Ignore the word. Click the INK colour it is written in.', word: word.name, inkHex: ink.hex, answer: ink.name, options: shuffle([ink.name, ...others]) };
  }

  function buildQuestions(diff) {
    if (task === 'Memory') return Array.from({ length: SESSION_LENGTH }, () => makeMemory(diff));
    if (task === 'Attention') return Array.from({ length: SESSION_LENGTH }, () => makeAttention(diff));
    return shuffle(QUIZ_BANK).slice(0, QUIZ_LENGTH).map(q => ({ type: 'quiz', prompt: q.prompt, answer: q.answer, options: shuffle(q.options) }));
  }

  function startRound() {
    clearAll();
    const diff = $('difficulty').value;
    session = {
      questions: buildQuestions(diff), current: 0, correct: 0, times: [],
      participant: $('name').value.trim() || 'Guest', task: task, difficulty: diff
    };
    renderQuestion();
  }

  function renderQuestion() {
    clearAll();
    if (session.current >= session.questions.length) return finish();
    const q = session.questions[session.current];
    const total = session.questions.length;
    locked = false;

    let body = '';
    if (q.type === 'memory') {
      body = `<div class="sequence" id="seq">${q.sequence}</div><p class="hint" id="hint">Memorize it. It hides in a moment.</p>`;
    } else if (q.type === 'attention') {
      body = `<div class="sequence" style="color:${q.inkHex}">${q.word}</div>`;
    } else {
      body = `<div class="timer"><div class="timer-bar" id="tbar"></div></div><p class="hint" id="ttext">${QUIZ_SECONDS}s</p>`;
    }

    stage.innerHTML = `
      <div class="progress-text">Question ${session.current + 1} of ${total}</div>
      <p class="question">${esc(q.prompt)}</p>
      ${body}
      <div class="options" id="opts"></div>
      <div class="feedback" id="fb"></div>`;

    const box = $('opts');
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'option' + (q.type === 'attention' ? ' ink' : '');
      b.textContent = opt;
      b.dataset.value = opt;
      b.addEventListener('click', () => answer(opt));
      box.appendChild(b);
    });

    if (q.type === 'memory') {
      setEnabled(false);
      timers.push(setTimeout(() => {
        $('seq').textContent = '•••';
        $('hint').textContent = 'Now choose the sequence you remember.';
        setEnabled(true);
        startedAt = performance.now();
      }, REVEAL_MS));
    } else if (q.type === 'quiz') {
      const steps = QUIZ_SECONDS * 10;
      let left = steps;
      startedAt = performance.now();
      countdown = setInterval(() => {
        left--;
        const bar = $('tbar'), txt = $('ttext');
        if (bar) bar.style.width = `${(left / steps) * 100}%`;
        if (txt) txt.textContent = `${Math.max(0, Math.ceil(left / 10))}s`;
        if (left <= 0) answer(null);
      }, 100);
    } else {
      startedAt = performance.now();
    }
  }

  function setEnabled(on) {
    document.querySelectorAll('#opts button').forEach(b => b.disabled = !on);
  }

  function answer(value) {
    if (!session || locked) return;
    locked = true;
    clearAll();
    const q = session.questions[session.current];
    const elapsed = value === null ? QUIZ_SECONDS * 1000 : Math.max(1, Math.round(performance.now() - startedAt));
    session.times.push(elapsed);
    const ok = value === q.answer;
    if (ok) session.correct++;

    document.querySelectorAll('#opts button').forEach(b => {
      b.disabled = true;
      if (b.dataset.value === q.answer) b.classList.add('correct');
      else if (b.dataset.value === value) b.classList.add('wrong');
    });
    if (q.type === 'memory' && $('seq')) $('seq').textContent = q.sequence;

    const fb = $('fb');
    if (value === null) { fb.textContent = `Time's up. Correct answer: ${q.answer}`; fb.className = 'feedback bad'; }
    else { fb.textContent = ok ? 'Correct!' : `Not quite. Correct answer: ${q.answer}`; fb.className = `feedback ${ok ? 'good' : 'bad'}`; }

    session.current++;
    timers.push(setTimeout(renderQuestion, NEXT_MS));
  }

  function workload(acc, avg) {
    let p = 0;
    if (acc < 60) p += 2; else if (acc < 80) p += 1;
    if (avg > 6000) p += 2; else if (avg > 3500) p += 1;
    return p >= 3 ? 'High' : p >= 1 ? 'Moderate' : 'Low';
  }

  function finish() {
    const s = session;
    session = null;
    const total = s.questions.length;
    const acc = Math.round((s.correct / total) * 100);
    const avg = s.times.reduce((a, b) => a + b, 0) / Math.max(s.times.length, 1);
    const level = workload(acc, avg);
    const tip = {
      Low: 'Great pace. Try a harder difficulty next.',
      Moderate: 'Solid result. Try the round again and compare.',
      High: 'Try an easier level, and take a short break before the next round.'
    }[level];

    stage.innerHTML = `
      <div class="result">
        <p class="progress-text">Round complete</p>
        <p class="score">${s.correct}/${total}</p>
        <p>${acc}% correct</p>
        <div class="stats">
          <div><strong>${(avg / 1000).toFixed(2)}s</strong>avg. response</div>
          <div><strong>${level}</strong>workload estimate</div>
        </div>
        <p class="muted">${tip}</p>
        <button class="secondary" id="again">Play again</button>
      </div>`;
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant: s.participant, task_type: s.task, difficulty: s.difficulty,
        question_count: total, correct_count: s.correct, accuracy: acc,
        avg_response_ms: Math.round(avg), workload: level
      })
    }).catch(() => {});

    $('again').addEventListener('click', startRound);
  }

  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      task = btn.dataset.task;
      document.querySelectorAll('.task-btn').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  $('start').addEventListener('click', () => {
    if (!$('name').value.trim()) {
      stage.innerHTML = '<div class="idle">Please enter your name first.</div>';
      $('name').focus();
      return;
    }
    startRound();
    $('play').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
