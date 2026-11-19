# Pomodoro Timer

A calm, distraction-free Pomodoro timer. Pick a focus or break session, press one button, and watch the ring count down.

**Live demo:** https://athensofgreece.github.io/pomodoro-timer/

## Features

- **Three session types:** Focus (25 min), Short break (5 min), Long break (15 min).
- **Adjustable length:** a slider sets any session from 1 to 60 minutes.
- **One main button:** Start, Pause and Resume share one control, with Reset beside it.
- **Progress ring:** shows the time left at a glance. The ring turns green during breaks.
- **Daily totals:** running focus time and number of completed sessions.
- **End-of-session alert:** a short sound and an on-screen message, with no blocking pop-up.
- **Time in the tab title:** keep an eye on the countdown while you work in another tab.
- **Light and dark themes:** follows your system setting, and remembers your choice.
- **Accessible:** keyboard friendly, visible focus outlines, screen-reader labels, and reduced-motion support.

## Tech

HTML, CSS and vanilla JavaScript. There is no build step and no dependencies. The font is Plus Jakarta Sans from Google Fonts.

## How it works

The countdown stores an end timestamp and recalculates the remaining time on every tick, instead of subtracting one second per interval. That keeps the timer accurate even if the browser throttles a background tab. Focus time is counted only while a Focus session is running.

## Run it locally

```bash
git clone https://github.com/athensofgreece/pomodoro-timer.git
cd pomodoro-timer
```

Open `index.html` in your browser. No server needed.

## Files

```text
├── index.html           # Page structure
├── pomodoro-timer.css   # Theme tokens, layout, components
├── pomodoro-timer.js    # Timer logic and theme toggle
└── alarm.mp3            # End-of-session sound
```

## Credits

Alarm sound by Vadim Makes Sound, from Pixabay (Pixabay Content License).
