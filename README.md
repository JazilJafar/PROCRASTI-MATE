# Procrasti-Mate

> Your potential is waiting. Unfortunately, so are you.

Procrasti-Mate is a local-first React/TypeScript focus companion for students and developers. It combines an honest timestamp-based timer with task management, contextual sarcastic roasts, optional browser speech, visibility distraction events, achievements, and real persisted analytics.

## Features

- Create, edit, select, complete, and delete tasks with priority and estimates.
- Focus timer with start, pause, resume, reset, finish, and timestamp-correct background-tab behavior.
- Ten curated roasts at each Mild, Savage, and Unhinged intensity, with cooldowns and optional SpeechSynthesis.
- Automatic local focus chimes: 5 for sessions up to 10 minutes, 5 for 25-minute sessions, and 10 for hour-long sessions.
- Webcam attention alerts are only active after explicit camera permission: a loud local alarm fires when a face is absent or turned away for 3 seconds, followed by quiet reminders at most twice per minute until attention returns.
- Visibility events are recorded only during active sessions; a test signal is available in the dashboard.
- Reversible Chaos Mode, reduced-motion support, keyboard focus indicators, and responsive neo-brutalist UI.
- Local achievements (First Blood, Locked In, Unbothered, Redemption Arc) and Recharts weekly history based only on actual sessions.
- Optional camera permission flow with clear fallback. No video, tasks, or analytics leave the browser.
- Branded SVG favicon and app icon with no external image dependency.

## Run

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run build
npm test
```

## Open source

Procrasti-Mate is open source under the [MIT License](./LICENSE).

Contributions are welcome:

1. Fork the repository.
2. Create a focused feature or fix branch.
3. Run `npm run build` and `npm test`.
4. Open a pull request with a short description of the change.

Please keep the project local-first, privacy-preserving, accessible, and usable without a webcam or paid API.

## Camera and privacy

Camera access is never requested on first run. Enable it explicitly in Settings. The browser may deny access, the device may have no camera, or computer-vision model support may be unavailable; all focus features continue to work without it. Camera tracks are stopped when disabled and raw frames are not persisted or uploaded. The browser Visibility API can detect tab hiding, but cannot detect phones or arbitrary desktop applications.

All tasks, preferences, achievements, and session history are stored in this browser's `localStorage`. There is no backend, account, API key, telemetry, or paid service.

## Demo walkthrough

1. Choose an intensity and default duration during onboarding.
2. Add a task, select it, and start Focus.
3. Pause/resume or finish a session; switch tabs while running to see a contextual roast.
4. Open Analytics for the real session chart and unlock achievements.
5. Try Settings for speech, duration, Chaos Mode, and the opt-in camera permission flow.

## Known limitations

Speech and camera APIs vary by browser and require secure contexts in production. Camera access is deliberately conservative and does not infer emotions or thoughts. A simple streak indicator reflects whether session history exists; calendar-day streak calculations can be extended without changing the storage format.
