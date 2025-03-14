// Theme toggling
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
});

// Timer functionality
const timer = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const workBtn = document.getElementById('workBtn');
const timerSlider = document.getElementById('timerSlider');
const totalFocusTime = document.getElementById('totalFocusTime');
const dropdownContent = document.getElementById('modeDropdown');
const endSound = document.getElementById('endSound');

let countdown;
let remainingTime = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let focusTimeSeconds = 0;
let focusTimer;
let currentMode = 'work';

function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateFocusTimeDisplay() {
    const minutes = Math.floor(focusTimeSeconds / 60);
    const seconds = focusTimeSeconds % 60;
    totalFocusTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setMode(mode, minutes) {
    currentMode = mode;
    pauseTimer();

    if (mode === 'work') {
        workBtn.innerHTML = 'Work <span id="dropdownIcon">▼</span>';
    } else if (mode === 'shortBreak') {
        workBtn.innerHTML = 'Short Break <span id="dropdownIcon">▼</span>';
    } else {
        workBtn.innerHTML = 'Long Break <span id="dropdownIcon">▼</span>';
    }

    timerSlider.value = minutes;
    remainingTime = minutes * 60;
    updateDisplay();

    dropdownContent.classList.remove('show');
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;

    countdown = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(countdown);
            isRunning = false;
            alert('Time is up!');
            endSound.play(); // Play sound when timer ends
            return;
        }

        remainingTime--;
        updateDisplay();
    }, 1000);

    if (currentMode === 'work') {
        focusTimer = setInterval(() => {
            focusTimeSeconds++;
            updateFocusTimeDisplay();
        }, 1000);
    }
}

function pauseTimer() {
    if (!isRunning) return;

    clearInterval(countdown);
    if (currentMode === 'work') {
        clearInterval(focusTimer);
    }
    isRunning = false;
}

function restartTimer() {
    pauseTimer();
    remainingTime = parseInt(timerSlider.value) * 60;
    updateDisplay();
}

timerSlider.addEventListener('input', () => {
    if (!isRunning) {
        remainingTime = parseInt(timerSlider.value) * 60;
        updateDisplay();
    }
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
restartBtn.addEventListener('click', restartTimer);

workBtn.addEventListener('click', () => {
    dropdownContent.classList.toggle('show');
});

window.addEventListener('click', (event) => {
    if (!event.target.matches('#workBtn') && !event.target.matches('#dropdownIcon')) {
        dropdownContent.classList.remove('show');
    }
});

workOption.addEventListener('click', () => {
    setMode('work', 25);
});

shortBreakOption.addEventListener('click', () => {
    setMode('shortBreak', 5);
});

longBreakOption.addEventListener('click', () => {
    setMode('longBreak', 15);
});

updateDisplay();
updateFocusTimeDisplay();