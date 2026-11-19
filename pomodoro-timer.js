(() => {
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const el = { time: $('timer'), state: $('state'), bar: $('bar'), start: $('startBtn'), reset: $('restartBtn'),
    slider: $('timerSlider'), lengthOut: $('lengthOut'), focus: $('totalFocusTime'), sessions: $('sessions'),
    sound: $('endSound'), announce: $('announce'), theme: $('themeToggle') };
  const modes = [...document.querySelectorAll('.mode')];
  const C = 2 * Math.PI * 90;
  const LABEL = { work: 'Focus', shortBreak: 'Short break', longBreak: 'Long break' };

  let mode = 'work', totalSec = 25 * 60, remaining = totalSec;
  let running = false, endAt = 0, tickId = null, lastTick = 0, focusMs = 0, done = 0;

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  function render() {
    el.time.textContent = mmss(remaining);
    el.bar.style.strokeDashoffset = C * (1 - remaining / totalSec);
    el.focus.textContent = mmss(Math.floor(focusMs / 1000));
    el.sessions.textContent = done;
    el.start.textContent = running ? 'Pause' : remaining < totalSec && remaining > 0 ? 'Resume' : 'Start';
    document.title = `${mmss(remaining)} · ${LABEL[mode]}`;
  }

  function tick() {
    const now = Date.now();
    if (mode === 'work') focusMs += now - lastTick;
    lastTick = now;
    remaining = Math.max(0, Math.ceil((endAt - now) / 1000));
    if (remaining === 0) return finish();
    render();
  }

  function start() {
    if (running || remaining === 0) return;
    running = true; lastTick = Date.now(); endAt = lastTick + remaining * 1000;
    tickId = setInterval(tick, 250);
    el.state.textContent = mode === 'work' ? 'Stay with one task' : 'Rest your eyes';
    render();
  }

  function pause(label = 'Paused') {
    if (!running) return;
    clearInterval(tickId); running = false;
    el.state.textContent = label; render();
  }

  function finish() {
    clearInterval(tickId); running = false;
    if (mode === 'work') done++;
    const msg = mode === 'work' ? 'Focus session complete. Take a break.' : 'Break over. Ready for the next session?';
    el.state.textContent = msg; el.announce.textContent = msg;
    el.sound.currentTime = 0; el.sound.play().catch(() => {});
    render();
  }

  function reset() {
    pause(); clearInterval(tickId);
    remaining = totalSec = parseInt(el.slider.value, 10) * 60;
    el.state.textContent = mode === 'work' ? 'Ready to focus' : 'Ready for a break';
    render();
  }

  function setMode(next, minutes) {
    pause(); mode = next; root.dataset.mode = next;
    modes.forEach((b) => { const on = b.dataset.mode === next; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    el.slider.value = minutes; el.lengthOut.textContent = `${minutes} min`;
    reset();
  }

  function setTheme(t) {
    root.dataset.theme = t;
    el.theme.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('pomodoro-theme', t); } catch (e) {}
  }

  el.start.addEventListener('click', () => (running ? pause() : start()));
  el.reset.addEventListener('click', reset);
  modes.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode, +b.dataset.min)));
  el.slider.addEventListener('input', () => {
    el.lengthOut.textContent = `${el.slider.value} min`;
    if (!running) { remaining = totalSec = el.slider.value * 60; render(); }
  });
  el.theme.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  let saved = null; try { saved = localStorage.getItem('pomodoro-theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  root.dataset.mode = 'work';
  render();
})();
