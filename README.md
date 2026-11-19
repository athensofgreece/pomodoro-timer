# Pomodoro Timer

A dark, neon Pomodoro timer for focused work. Pick a task, press one button, and let the glowing ring count down. It tracks your sessions, builds a focus cycle, and keeps a daily goal and streak.

**Live demo:** https://athensofgreece.github.io/pomodoro-timer/

![Pomodoro Timer screenshot](screenshot.png)

## Features

- **Focus and break modes:** Focus (25 min), Short break (5 min), Long break (15 min), with a slider for any length from 1 to 60 minutes.
- **Task list:** add tasks, tap one to make it your current task, and see how many sessions each task took.
- **4-session cycle:** four dots track your focus sessions. After the fourth, you get a long break.
- **Auto-start:** an optional switch that starts the next session for you.
- **Ambient sound:** rain, waves, or brown noise, generated in the browser with the Web Audio API. No audio files needed.
- **Daily goal and streak:** set a session goal for the day and keep a streak of days you hit it.
- **Remembers everything:** tasks, goal, streak and settings are saved in your browser.
- **Accessible:** keyboard friendly, visible focus outlines, screen-reader labels, large touch targets and reduced-motion support.

## Tech

HTML, CSS and vanilla JavaScript. No build step and no dependencies. Fonts: Space Grotesk and Inter from Google Fonts.

## How it works

- **Accurate countdown:** the timer stores an end timestamp and recalculates the time left on every tick, so it stays correct even when the browser slows a background tab.
- **Generated sound:** rain is filtered white noise. Waves and brown noise are low-passed noise, and waves add a slow volume swell.
- **Saved data:** state is stored in `localStorage` as one JSON object, with each day's sessions, focus time and goal status keyed by date.

## Run it locally

```bash
git clone https://github.com/athensofgreece/pomodoro-timer.git
cd pomodoro-timer
```

Open `index.html` in your browser. No server needed.

## Files

```text
├── index.html           # Page structure
├── pomodoro-timer.css   # Design tokens, layout, components
├── pomodoro-timer.js    # Timer, tasks, cycle, goal, streak, ambient sound
└── alarm.mp3            # End-of-session sound
```

## Credits

Alarm sound by Vadim Makes Sound, from Pixabay (Pixabay Content License).
