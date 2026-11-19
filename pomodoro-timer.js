(() => {
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const el = Object.fromEntries(['timer','state','bar','startBtn','restartBtn','timerSlider','lengthOut','totalFocusTime','sessions','streak',
    'endSound','announce','autoStart','ambient','tasks','taskForm','taskInput','now','dots','goalOut','goalUp','goalDown','meter','meterFill','today'].map((i) => [i, $(i)]));
  const modes = [...document.querySelectorAll('.mode')];
  const C = 2 * Math.PI * 90, KEY = 'pomo:v2';
  const LABEL = { work: 'Focus', shortBreak: 'Short break', longBreak: 'Long break' };
  const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA');

  // ---- saved data (browser storage may be blocked, so every access is guarded) ----
  let S = { tasks: [], activeId: null, goal: 4, days: {}, autoStart: false, ambient: 'off' };
  try { S = { ...S, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const today = () => (S.days[dayKey()] ||= { sessions: 0, focusSec: 0, met: false });

  // ---- timer state ----
  let mode = 'work', totalSec = 1500, remaining = 1500, running = false, endAt = 0, lastTick = 0, tickId = null, cycle = 0;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const activeTask = () => S.tasks.find((t) => t.id === S.activeId && !t.done);

  function streak() {
    let n = 0; const d = new Date();
    if (!S.days[dayKey(d)]?.met) d.setDate(d.getDate() - 1);
    while (S.days[dayKey(d)]?.met) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function render() {
    const t = today(), a = activeTask();
    el.timer.textContent = mmss(remaining);
    el.bar.style.strokeDashoffset = C * (1 - remaining / totalSec);
    el.startBtn.textContent = running ? 'Pause' : remaining < totalSec && remaining > 0 ? 'Resume' : 'Start';
    el.now.innerHTML = ''; 
    if (mode === 'work' && a) { el.now.append('Focusing on '); const b = document.createElement('b'); b.textContent = a.text; el.now.append(b); }
    else el.now.textContent = mode === 'work' ? 'Pick a task, or just start' : 'Step away from the screen';
    [...el.dots.children].forEach((d, i) => d.classList.toggle('on', i < (mode === 'longBreak' ? 4 : cycle)));
    el.dots.setAttribute('aria-label', `${cycle} of 4 focus sessions done`);
    el.sessions.textContent = t.sessions; el.totalFocusTime.textContent = mmss(Math.floor(t.focusSec));
    el.streak.textContent = `${streak()} d`; el.goalOut.textContent = S.goal;
    el.meterFill.style.width = `${Math.min(100, (t.sessions / S.goal) * 100)}%`;
    el.meter.setAttribute('aria-valuemax', S.goal); el.meter.setAttribute('aria-valuenow', t.sessions);
    document.title = `${mmss(remaining)} · ${LABEL[mode]}`;
  }

  // ---- ambient sound (generated in the browser, no audio files needed) ----
  let ctx, src, gain;
  function noise(kind) {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = kind === 'rain' ? w : (last + 0.02 * w) / 1.02; d[i] = kind === 'rain' ? w : last * 3.5; }
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const f = ctx.createBiquadFilter(); gain = ctx.createGain();
    if (kind === 'rain') { f.type = 'bandpass'; f.frequency.value = 3500; f.Q.value = 0.4; gain.gain.value = 0.18; }
    else { f.type = 'lowpass'; f.frequency.value = kind === 'waves' ? 600 : 900; gain.gain.value = 0.5; }
    if (kind === 'waves') { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 0.1; lg.gain.value = 0.3; l.connect(lg).connect(gain.gain); l.start(); s._lfo = l; }
    s.connect(f).connect(gain).connect(ctx.destination); s.start(); return s;
  }
  function stopAmbient() { try { src?.stop(); src?._lfo?.stop(); } catch (e) {} src = null; }
  function syncAmbient() { stopAmbient(); if (running && S.ambient !== 'off') { try { src = noise(S.ambient); ctx.resume(); } catch (e) {} } }

  // ---- timer ----
  function tick() {
    const now = Date.now();
    if (mode === 'work') today().focusSec += (now - lastTick) / 1000;
    lastTick = now; remaining = Math.max(0, Math.ceil((endAt - now) / 1000));
    if (remaining === 0) return finish();
    render();
  }
  function start() {
    if (running || remaining === 0) return;
    running = true; lastTick = Date.now(); endAt = lastTick + remaining * 1000; tickId = setInterval(tick, 250);
    el.state.textContent = mode === 'work' ? 'Stay with one task' : 'Rest and breathe'; syncAmbient(); render();
  }
  function pause(label = 'Paused') {
    if (!running) return;
    clearInterval(tickId); running = false; el.state.textContent = label; syncAmbient(); save(); render();
  }
  function finish() {
    clearInterval(tickId); running = false; syncAmbient();
    let next;
    if (mode === 'work') {
      const t = today(); t.sessions++; cycle++; const a = activeTask(); if (a) a.pomos = (a.pomos || 0) + 1;
      if (!t.met && t.sessions >= S.goal) t.met = true;
      next = cycle >= 4 ? 'longBreak' : 'shortBreak';
    } else { if (mode === 'longBreak') cycle = 0; next = 'work'; }
    const msg = mode === 'work' ? 'Focus session complete. Time for a break.' : 'Break over. Ready for the next focus session?';
    el.announce.textContent = msg; el.sound.currentTime = 0; el.sound.play().catch(() => {}); save();
    setMode(next, false); el.state.textContent = msg; renderTasks();
    if (S.autoStart) setTimeout(() => { if (!running) start(); }, 2500);
  }
  function reset() {
    pause(); clearInterval(tickId);
    remaining = totalSec = el.timerSlider.value * 60;
    el.state.textContent = mode === 'work' ? 'Ready to focus' : 'Ready for a break'; render();
  }
  function setMode(next, doReset = true) {
    pause(); mode = next; root.dataset.mode = next;
    const b = modes.find((m) => m.dataset.mode === next);
    modes.forEach((m) => { m.classList.toggle('is-active', m === b); m.setAttribute('aria-pressed', m === b); });
    el.timerSlider.value = b.dataset.min; el.lengthOut.textContent = `${b.dataset.min} min`;
    remaining = totalSec = b.dataset.min * 60; el.state.textContent = next === 'work' ? 'Ready to focus' : 'Ready for a break'; render();
  }

  // ---- tasks ----
  function renderTasks() {
    el.tasks.innerHTML = '';
    S.tasks.forEach((t) => {
      const li = document.createElement('li'); li.className = `task${t.done ? ' done' : ''}${t.id === S.activeId && !t.done ? ' active' : ''}`;
      const chk = document.createElement('label'); chk.className = 'chk';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done; cb.setAttribute('aria-label', `Mark done: ${t.text}`);
      cb.onchange = () => { t.done = cb.checked; if (t.done && S.activeId === t.id) S.activeId = null; save(); renderTasks(); render(); };
      chk.append(cb);
      const txt = document.createElement('button'); txt.type = 'button'; txt.className = 'txt'; txt.textContent = t.text; txt.title = 'Set as current task';
      txt.onclick = () => { if (!t.done) { S.activeId = S.activeId === t.id ? null : t.id; save(); renderTasks(); render(); } };
      const n = document.createElement('span'); n.className = 'n'; n.textContent = t.pomos ? `${t.pomos} 🍅` : '';
      const del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×'; del.setAttribute('aria-label', `Delete ${t.text}`);
      del.onclick = () => { S.tasks = S.tasks.filter((x) => x !== t); if (S.activeId === t.id) S.activeId = null; save(); renderTasks(); render(); };
      li.append(chk, txt, n, del); el.tasks.append(li);
    });
  }

  // ---- events ----
  el.startBtn.onclick = () => (running ? pause() : start());
  el.restartBtn.onclick = reset;
  modes.forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
  el.timerSlider.oninput = () => { el.lengthOut.textContent = `${el.timerSlider.value} min`; if (!running) { remaining = totalSec = el.timerSlider.value * 60; render(); } };
  el.taskForm.onsubmit = (e) => {
    e.preventDefault(); const text = el.taskInput.value.trim(); if (!text) return;
    const t = { id: Date.now(), text, done: false, pomos: 0 }; S.tasks.unshift(t); if (!activeTask()) S.activeId = t.id;
    el.taskInput.value = ''; save(); renderTasks(); render();
  };
  el.autoStart.onchange = () => { S.autoStart = el.autoStart.checked; save(); };
  el.ambient.onchange = () => { S.ambient = el.ambient.value; save(); syncAmbient(); };
  const goal = (d) => { S.goal = Math.min(12, Math.max(1, S.goal + d)); const t = today(); if (t.sessions >= S.goal) t.met = true; save(); render(); };
  el.goalUp.onclick = () => goal(1); el.goalDown.onclick = () => goal(-1);

  el.autoStart.checked = !!S.autoStart; el.ambient.value = S.ambient;
  el.today.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  root.dataset.mode = 'work'; renderTasks(); render();
})();
