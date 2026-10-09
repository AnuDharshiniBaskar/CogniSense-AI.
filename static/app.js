(() => {
  const SESSION_LENGTH = 8;
  const NEXT_MS = 1800;

  // ---------- Difficulty settings ----------
  const MEMORY_LEVELS = {
    Easy:     { length: 3, showMs: 2500, reverse: false, chars: 'digits' },
    Moderate: { length: 4, showMs: 1800, reverse: false, chars: 'digits' },
    Hard:     { length: 6, showMs: 1200, reverse: true,  chars: 'mixed' }
  };
  const ATTENTION_LEVELS = {
    Easy:     { options: 3, showMs: 1200, mixed: false },
    Moderate: { options: 4, showMs: 800,  mixed: false },
    Hard:     { options: 6, showMs: 500,  mixed: true  }
  };
  const WORD_LEVELS = {
    Easy:     { count: 5, showMs: 1000, hard: false },
    Moderate: { count: 6, showMs: 900,  hard: false },
    Hard:     { count: 7, showMs: 700,  hard: true  }
  };
  const SHAPE_LEVELS = {
    Easy:     { count: 3, showMs: 2200, trick: 0 },
    Moderate: { count: 4, showMs: 1800, trick: 1 },
    Hard:     { count: 5, showMs: 1400, trick: 3 }
  };
  const GRID_LEVELS = {
    Easy:     { size: 3, length: 3, flashMs: 700 },
    Moderate: { size: 3, length: 4, flashMs: 600 },
    Hard:     { size: 4, length: 5, flashMs: 450 }
  };

  const DIGITS = ['1','2','3','4','5','6','7','8','9'];
  const MIXED = ['A','B','C','D','E','F','G','H','J','K','M','N','P','Q','R','T','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  const COLORS = [
    { name: 'BLUE', hex: '#3b82f6' }, { name: 'GREEN', hex: '#22c55e' },
    { name: 'RED', hex: '#ef4444' }, { name: 'YELLOW', hex: '#eab308' },
    { name: 'PURPLE', hex: '#a855f7' }, { name: 'ORANGE', hex: '#f97316' },
    { name: 'PINK', hex: '#ec4899' }, { name: 'TEAL', hex: '#14b8a6' }
  ];
  const SHAPES = [
    { sym: '★', name: 'Star' }, { sym: '●', name: 'Circle' }, { sym: '■', name: 'Square' },
    { sym: '▲', name: 'Triangle' }, { sym: '◆', name: 'Diamond' }, { sym: '♥', name: 'Heart' }
  ];
  const WORD_POOL = ['apple','river','candle','pencil','garden','bridge','window','planet','violin','tiger',
    'castle','ticket','mirror','anchor','basket','coin','desert','feather','guitar','hammer',
    'island','jacket','kettle','ladder','magnet','needle','orange','pillow','rocket','saddle',
    'tunnel','valley','wallet','yogurt','zipper','bottle','camera','dragon','forest','lantern'];

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  let task = 'Memory';
  let session = null;
  let timers = [];
  let locked = false;
  let startedAt = 0;

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
  const cap = (s) => s.charAt(0) + s.slice(1).toLowerCase();
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function clearAll() { timers.forEach(clearTimeout); timers = []; }

  // ---------- Question generators ----------
  function makeMemory(diff) {
    const cfg = MEMORY_LEVELS[diff];
    const pool = cfg.chars === 'mixed' ? MIXED : DIGITS;
    const items = shuffle(pool).slice(0, cfg.length);
    const target = cfg.reverse ? [...items].reverse() : items;
    const answer = target.join(' ');
    const wrong = new Set();
    if (cfg.reverse) wrong.add(items.join(' '));
    for (let k = 0; k < cfg.length - 1; k++) {
      const a = [...target];
      [a[k], a[k + 1]] = [a[k + 1], a[k]];
      wrong.add(a.join(' '));
    }
    for (let g = 0; wrong.size < 12 && g < 300; g++) {
      const a = [...target];
      const i = randInt(cfg.length);
      let c;
      do { c = pick(pool); } while (target.includes(c));
      a[i] = c;
      wrong.add(a.join(' '));
    }
    wrong.delete(answer);
    return {
      type: 'memory', showMs: cfg.showMs,
      prompt: cfg.reverse ? 'Remember the sequence. Choose it in REVERSE order.' : 'Remember the sequence, then choose it.',
      sequence: items.join(' '), answer,
      options: shuffle([answer, ...shuffle([...wrong]).slice(0, 3)])
    };
  }

  function makeAttention(diff) {
    const cfg = ATTENTION_LEVELS[diff];
    const word = pick(COLORS);
    let ink;
    do { ink = pick(COLORS); } while (ink.name === word.name);
    const askWord = cfg.mixed && Math.random() < 0.5;
    const answer = askWord ? word.name : ink.name;
    const others = shuffle(COLORS.map(c => c.name).filter(n => n !== answer)).slice(0, cfg.options - 1);
    return {
      type: 'attention', showMs: cfg.showMs, word: word.name, inkHex: ink.hex, askWord,
      prompt: askWord ? 'Ignore the colour. Click the WORD it says.' : 'Ignore the word. Click the INK colour.',
      answer, options: shuffle([answer, ...others])
    };
  }

  function makeWords(diff) {
    const cfg = WORD_LEVELS[diff];
    const all = shuffle(WORD_POOL);
    const list = all.slice(0, cfg.count);
    const outside = all.slice(cfg.count, cfg.count + 3);
    let answer, options, prompt;
    if (cfg.hard) {
      answer = outside[0];
      options = shuffle([answer, ...shuffle(list).slice(0, 3)]);
      prompt = 'Which word was NOT in the list?';
    } else {
      answer = pick(list);
      options = shuffle([answer, ...outside]);
      prompt = 'Which word was in the list?';
    }
    return { type: 'words', list, showMs: cfg.showMs, prompt, answer, options };
  }

  function makeShapes(diff) {
    const cfg = SHAPE_LEVELS[diff];
    const shapes = shuffle(SHAPES).slice(0, cfg.count);
    const items = shapes.map(sh => ({ shape: sh, color: pick(COLORS) }));
    const target = pick(items);
    const label = (c, sh) => `${cap(c.name)} ${sh.name}`;
    const correct = label(target.color, target.shape);
    const wrong = new Set();
    // Tricky options: a shape that WAS shown, but with a different colour
    shuffle(items).slice(0, cfg.trick).forEach(it => {
      let c;
      do { c = pick(COLORS); } while (c.name === it.color.name);
      wrong.add(label(c, it.shape));
    });
    // Fill with combinations that were not shown at all
    for (let g = 0; wrong.size < 3 && g < 500; g++) {
      const sh = pick(SHAPES), c = pick(COLORS);
      const shown = items.some(it => it.shape === sh && it.color.name === c.name);
      const lbl = label(c, sh);
      if (!shown && lbl !== correct) wrong.add(lbl);
    }
    wrong.delete(correct);
    const rowHtml = items.map(it => `<span style="color:${it.color.hex}">${it.shape.sym}</span>`).join('');
    return {
      type: 'shapes', showMs: cfg.showMs, rowHtml,
      prompt: 'Which shape was in the row, with its colour?',
      answer: correct, options: shuffle([correct, ...[...wrong].slice(0, 3)])
    };
  }

  function makeGrid(diff) {
    const cfg = GRID_LEVELS[diff];
    const cells = cfg.size * cfg.size;
    const seq = [];
    while (seq.length < cfg.length) {
      const c = randInt(cells);
      if (!seq.includes(c)) seq.push(c);
    }
    return { type: 'grid', size: cfg.size, seq, flashMs: cfg.flashMs,
             prompt: 'Watch the blocks light up, then tap them in the same order.' };
  }

  const MAKERS = { Memory: makeMemory, Attention: makeAttention, Words: makeWords, Shapes: makeShapes, Grid: makeGrid };

  // ---------- Round flow ----------
  function startRound() {
    clearAll();
    const diff = $('difficulty').value;
    session = {
      questions: Array.from({ length: SESSION_LENGTH }, () => MAKERS[task](diff)),
      current: 0, correct: 0, times: [],
      participant: $('name').value.trim() || 'Guest', task, difficulty: diff
    };
    renderQuestion();
  }

  function stimulusHtml(q) {
    switch (q.type) {
      case 'memory':
        return `<div class="sequence" id="stim">${esc(q.sequence)}</div>
                <p class="hint" id="hint">Memorize it. It hides in a moment.</p>`;
      case 'attention':
        return `<div class="sequence" id="stim" style="color:${q.inkHex}">${esc(q.word)}</div>
                <p class="hint" id="hint">Remember the word and its colour. They hide in a moment.</p>`;
      case 'words':
        return `<div class="sequence" id="stim">${esc(q.list[0])}</div>
                <p class="hint" id="hint">Words appear one by one.</p>`;
      case 'shapes':
        return `<div class="shapes" id="stim">${q.rowHtml}</div>
                <p class="hint" id="hint">Remember the shapes and their colours.</p>`;
      case 'grid': {
        const cells = Array.from({ length: q.size * q.size },
          (_, i) => `<button class="cell" data-i="${i}" disabled></button>`).join('');
        return `<div class="grid" id="grid" style="grid-template-columns:repeat(${q.size},1fr)">${cells}</div>
                <p class="hint" id="hint">Watch the order.</p>`;
      }
    }
    return '';
  }

  function renderQuestion() {
    clearAll();
    if (!session) return;
    if (session.current >= session.questions.length) return finish();
    const q = session.questions[session.current];
    locked = false;
    stage.innerHTML = `
      <div class="progress-text">Question ${session.current + 1} of ${session.questions.length}</div>
      <p class="question">${esc(q.prompt)}</p>
      ${stimulusHtml(q)}
      <div class="options" id="opts"></div>
      <div class="feedback" id="fb"></div>`;
    if (q.type === 'grid') return runGrid(q);
    runStimulus(q);
  }

  // Shows the stimulus, hides it after showMs, then draws the options.
  function runStimulus(q) {
    if (q.type === 'words') {
      q.list.slice(1).forEach((w, i) => later(() => { $('stim').textContent = w; }, (i + 1) * q.showMs));
    }
    const hideAt = q.type === 'words' ? q.list.length * q.showMs : q.showMs;
    later(() => {
      const el = $('stim');
      if (q.type === 'attention') { el.textContent = '?'; el.style.color = ''; }
      else el.textContent = '•••';
      $('hint').textContent =
        q.type === 'memory' ? 'Now choose the sequence you remember.' :
        q.type === 'attention' ? (q.askWord ? 'Now click the WORD.' : 'Now click the INK colour.') :
        q.type === 'words' ? 'Now choose the word from the list.' :
        'Now choose the shape that was in the row.';
      drawOptions(q);
      startedAt = performance.now();
    }, hideAt);
  }

  function drawOptions(q) {
    const box = $('opts');
    if (!box) return;
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'option' + (q.type === 'attention' ? ' ink' : '');
      b.textContent = opt;
      b.dataset.value = opt;
      b.addEventListener('click', () => answer(opt));
      box.appendChild(b);
    });
  }

  function reveal(q) {
    const el = $('stim');
    if (!el) return;
    if (q.type === 'memory') el.textContent = q.sequence;
    if (q.type === 'attention') { el.textContent = q.word; el.style.color = q.inkHex; }
    if (q.type === 'words') { el.textContent = q.list.join('  ·  '); el.style.fontSize = '20px'; }
    if (q.type === 'shapes') el.innerHTML = q.rowHtml;
  }

  function answer(value) {
    if (!session || locked) return;
    const q = session.questions[session.current];
    const elapsed = performance.now() - startedAt;
    const ok = value === q.answer;
    document.querySelectorAll('#opts button').forEach(b => {
      b.disabled = true;
      if (b.dataset.value === q.answer) b.classList.add('correct');
      else if (b.dataset.value === value) b.classList.add('wrong');
    });
    reveal(q);
    scoreQuestion(ok, elapsed, ok ? 'Correct!' : `Not quite. Correct answer: ${q.answer}`);
  }

  // ---------- Grid game ----------
  function runGrid(q) {
    const cells = [...document.querySelectorAll('#grid .cell')];
    const lockGrid = () => cells.forEach(c => c.disabled = true);
    const flashStart = 400;
    const gap = 250;
    q.seq.forEach((idx, k) => {
      const on = flashStart + k * (q.flashMs + gap);
      later(() => cells[idx].classList.add('lit'), on);
      later(() => cells[idx].classList.remove('lit'), on + q.flashMs);
    });
    const ready = flashStart + q.seq.length * (q.flashMs + gap);
    later(() => {
      $('hint').textContent = 'Now tap the blocks in the same order.';
      let step = 0;
      const inputStart = performance.now();
      cells.forEach((cell, idx) => {
        cell.disabled = false;
        cell.addEventListener('click', () => {
          if (!session || locked) return;
          if (idx === q.seq[step]) {
            cell.classList.add('good');
            cell.disabled = true;
            step++;
            if (step === q.seq.length) {
              lockGrid();
              scoreQuestion(true, performance.now() - inputStart, 'Correct!');
            }
          } else {
            cell.classList.add('bad');
            lockGrid();
            scoreQuestion(false, performance.now() - inputStart, 'Not quite. Watch the order more carefully.');
          }
        });
      });
    }, ready);
  }

  // ---------- Scoring and finish ----------
  function scoreQuestion(ok, elapsed, text) {
    if (!session) return;
    locked = true;
    clearAll();
    session.times.push(Math.max(1, Math.round(elapsed)));
    if (ok) session.correct++;
    const fb = $('fb');
    if (fb) { fb.textContent = text; fb.className = `feedback ${ok ? 'good' : 'bad'}`; }
    session.current++;
    later(renderQuestion, NEXT_MS);
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

  // ---------- Wiring ----------
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
