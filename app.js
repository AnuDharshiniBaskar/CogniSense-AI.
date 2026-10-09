
(() => {
  const SESSION_LENGTH = 8;
  const QUIZ_LENGTH = 10;
  const QUIZ_SECONDS = 15;
  const MEMORY_LEVELS = {
    Easy:     { length: 3, showMs: 2500, reverse: false, chars: 'digits' },
    Moderate: { length: 4, showMs: 1800, reverse: false, chars: 'digits' },
    Hard:     { length: 6, showMs: 1200, reverse: true,  chars: 'mixed' }
  };
  const DIGITS = ['1','2','3','4','5','6','7','8','9'];
  const MIXED = ['A','B','C','D','E','F','G','H','J','K','M','N','P','Q','R','T','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  const ATTENTION_OPTIONS = { Easy: 3, Moderate: 4, Hard: 5 };
  const ATTENTION_SHOW = { Easy: 1500, Moderate: 1000, Hard: 700 };
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
    { prompt: "Working memory is most often associated with which model?", options: ["Baddeley and Hitch", "Freud's id model", "Piaget's stage theory", "Pavlov's conditioning"], answer: "Baddeley and Hitch" },
    { prompt: "The method of loci (memory palace) works by:", options: ["Linking items to locations in a familiar place", "Repeating items out loud", "Writing items in alphabetical order", "Sleeping right after learning"], answer: "Linking items to locations in a familiar place" },
    { prompt: "The spacing effect says learning is better when:", options: ["Study is spread out over time", "All study is done in one long session", "Items are only read once", "You study while distracted"], answer: "Study is spread out over time" },
    { prompt: "Why does retrieval practice (self-testing) improve memory?", options: ["It strengthens the pathways used to retrieve information", "It removes the need to remember", "It increases sensory input", "It eliminates forgetting"], answer: "It strengthens the pathways used to retrieve information" },
    { prompt: "The peg-word technique links list items to:", options: ["Pre-learned rhyming number words, like one-bun and two-shoe", "A random list of colours", "Musical notes", "Alphabet letters only"], answer: "Pre-learned rhyming number words, like one-bun and two-shoe" },
    { prompt: "Making the word ROYGBIV to remember rainbow colours is an example of:", options: ["An acronym mnemonic", "The method of loci", "Dual coding", "Priming"], answer: "An acronym mnemonic" },
    { prompt: "Dual coding theory suggests memory improves when information is encoded as:", options: ["Both verbal and visual representations", "Only numbers", "Only repeated text", "Only sounds"], answer: "Both verbal and visual representations" },
    { prompt: "Elaborative encoding works by:", options: ["Connecting new information to existing knowledge and meaning", "Repeating the same word many times", "Ignoring the meaning of the material", "Reading faster"], answer: "Connecting new information to existing knowledge and meaning" },
    { prompt: "Interleaved practice means:", options: ["Mixing different types of problems in one session", "Practising one skill only", "Studying in complete silence", "Doing the same question repeatedly"], answer: "Mixing different types of problems in one session" },
    { prompt: "The keyword method is mainly used for learning:", options: ["Vocabulary in a foreign language", "Driving routes", "Musical scales", "Mathematical proofs"], answer: "Vocabulary in a foreign language" },
    { prompt: "Massed practice means:", options: ["Cramming many study hours into one session", "Spreading study across several days", "Testing yourself after each topic", "Using pictures instead of words"], answer: "Cramming many study hours into one session" },
    { prompt: "Maintenance rehearsal (repeating an item) is most useful for:", options: ["Holding information briefly in working memory", "Building long-term meaningful memories", "Remembering visual scenes only", "Forgetting information faster"], answer: "Holding information briefly in working memory" },
    { prompt: "According to levels of processing theory, memory is strongest when information is processed:", options: ["Deeply, focusing on meaning", "Shallowly, focusing on sound or appearance", "Without attention", "Only through repetition"], answer: "Deeply, focusing on meaning" },
    { prompt: "The picture superiority effect means that:", options: ["Pictures are usually remembered better than words", "Pictures are never forgotten", "Pictures use no working memory", "Words are always remembered wrongly"], answer: "Pictures are usually remembered better than words" },
    { prompt: "Context-dependent memory means recall is better when:", options: ["The recall setting matches the learning setting", "You learn only in a noisy place", "You change rooms often", "Information is written in capital letters"], answer: "The recall setting matches the learning setting" },
    { prompt: "Which technique turns new information into a story or a vivid image to remember it?", options: ["Mnemonic imagery", "Massed practice", "Shadowing", "Priming"], answer: "Mnemonic imagery" }
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
    const cfg = MEMORY_LEVELS[diff];
    const pool = cfg.chars === 'mixed' ? MIXED : DIGITS;
    const items = shuffle(pool).slice(0, cfg.length);
    const target = cfg.reverse ? [...items].reverse() : items;
    const answer = target.join(' ');

    const wrong = new Set();
    // Common mistake: forgetting to reverse the order
    if (cfg.reverse) wrong.add(items.join(' '));
    // Adjacent swaps: look almost right
    for (let k = 0; k < cfg.length - 1; k++) {
      const a = [...target];
      [a[k], a[k + 1]] = [a[k + 1], a[k]];
      wrong.add(a.join(' '));
    }
    // One symbol changed
    for (let g = 0; wrong.size < 12 && g < 300; g++) {
      const a = [...target];
      const i = randInt(cfg.length);
      let c;
      do { c = pick(pool); } while (target.includes(c));
      a[i] = c;
      wrong.add(a.join(' '));
    }
    wrong.delete(answer);
    const options = shuffle([answer, ...shuffle([...wrong]).slice(0, 3)]);

    return {
      type: 'memory',
      prompt: cfg.reverse
        ? 'Remember the sequence. Choose it in REVERSE order.'
        : 'Remember the sequence, then choose it.',
      sequence: items.join(' '),
      showMs: cfg.showMs,
      answer,
      options
    };
  }

  function makeAttention(diff) {
    const word = pick(COLORS);
    let ink;
    do { ink = pick(COLORS); } while (ink.name === word.name);
    const others = shuffle(COLORS.filter(c => c.name !== ink.name)).slice(0, ATTENTION_OPTIONS[diff] - 1).map(c => c.name);
    return { type: 'attention', showMs: ATTENTION_SHOW[diff], prompt: 'Ignore the word. Click the INK colour it is written in.', word: word.name, inkHex: ink.hex, answer: ink.name, options: shuffle([ink.name, ...others]) };
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
      body = `<div class="sequence" id="stim" style="color:${q.inkHex}">${q.word}</div><p class="hint" id="hint">Look at the word. Options appear once it hides.</p>`;
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
    const drawOptions = () => {
      q.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'option' + (q.type === 'attention' ? ' ink' : '');
        b.textContent = opt;
        b.dataset.value = opt;
        b.addEventListener('click', () => answer(opt));
        box.appendChild(b);
      });
    };

    if (q.type === 'memory' || q.type === 'attention') {
      // Options stay hidden while the stimulus is visible; they appear once it hides.
      const stimId = q.type === 'memory' ? 'seq' : 'stim';
      timers.push(setTimeout(() => {
        $(stimId).textContent = '•••';
        $('hint').textContent = q.type === 'memory'
          ? 'Now choose the sequence you remember.'
          : 'Now click the INK colour, not the word.';
        drawOptions();
        startedAt = performance.now();
      }, q.showMs));
    } else {
      drawOptions();
    }

    if (q.type === 'quiz') {
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
    if (q.type === 'attention' && $('stim')) $('stim').textContent = q.word;

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
