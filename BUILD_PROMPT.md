# PROCRASTI-MATE — ONE-PROMPT HACKATHON BUILD

Act as a senior product engineer, UI/UX designer, and frontend developer. Build a complete, working hackathon MVP called **Procrasti-Mate** in the current VS Code workspace.

This is an implementation task, not a tutorial. Inspect the workspace, create and edit the necessary files, implement the application, run the available checks, and fix errors. Do not stop after producing a plan or a static landing page.

## 1. PRODUCT

Procrasti-Mate is a sarcastic AI productivity companion for students and developers.

Tagline: "Your potential is waiting. Unfortunately, so are you."

It helps users stay on task using:
- Task management.
- A functional focus timer.
- Optional real webcam-based face and head-orientation signals.
- Contextual sarcastic roasts.
- Browser text-to-speech.
- Browser tab-switch detection.
- Opt-in, reversible Chaos Mode.
- Focus statistics and achievements.

Build the smallest polished, credible implementation of these features. Prioritize reliability and visual quality over unnecessary complexity.

## 2. TECH STACK

Use:
- React + TypeScript + Vite.
- Tailwind CSS.
- Framer Motion for purposeful animations.
- Lucide React for icons.
- MediaPipe Tasks Vision for optional local computer vision.
- Browser SpeechSynthesis API for voice.
- Recharts for real analytics.
- localStorage for tasks, preferences, achievements, and session history.
- Vitest and React Testing Library for essential tests.

Use compatible stable dependency versions. Keep the project simple. Do not add a backend, login system, paid AI API, or external database unless genuinely necessary.

The basic application must work without paid API keys or webcam access.

## 3. ART DIRECTION — EXTREMELY IMPORTANT

Create a distinctive, high-quality indie software product with an editorial neo-brutalist aesthetic.

It should feel art-directed by a skilled developer, not generated from a generic AI dashboard template.

Visual identity:
- Background: #0A0A0A.
- Primary surface: #141414.
- Elevated surface: #1E1E1E.
- Acid-lime accent: #C6FF4A.
- Coral accent: #FF6B4A.
- Main text: #F5F5F0.
- Muted text: #9B9B95.
- Headings: Space Grotesk or an equivalent expressive typeface.
- Body: Inter or an equivalent clean sans-serif.
- Timer and metrics: a monospaced typeface.

Design characteristics:
- Oversized typography.
- Strong alignment and deliberate asymmetry.
- Thin borders rather than excessive shadows.
- Generous whitespace.
- Editorial layouts and distinctive section labels.
- Large, memorable countdown timer.
- Crisp buttons with intentional hover and pressed states.
- Restrained use of acid lime for primary actions and important status indicators.
- Coral reserved for distraction events and warning states.
- Short, meaningful animations.
- Carefully designed empty states.
- Responsive desktop and mobile layouts.

Avoid:
- Purple or blue AI gradients.
- Glassmorphism everywhere.
- Glowing borders on every component.
- Generic dashboard cards repeated in every section.
- Excessive rounded corners.
- Cartoon mascots and childish illustrations.
- Random particle effects.
- Unnecessary animated backgrounds.
- Fake analytics, fake camera detections, and decorative nonfunctional buttons.
- Overdesigned layouts that sacrifice usability.

Create a cohesive visual language with a few excellent components rather than many generic components. Make the interface memorable, precise, and professional.

## 4. APPLICATION EXPERIENCE

Implement a complete, navigable single-page application with:

### A. First-run experience
Introduce Procrasti-Mate, explain its functionality, and let users configure:
- Roast intensity: Mild, Savage, Unhinged.
- Speech on/off.
- Sound effects on/off.
- Default focus duration.
- Optional webcam monitoring.

Never request camera permission before the user explicitly enables it.

### B. Dashboard
Display:
- A welcome message with witty, understated copy.
- Today's focus time.
- Completed sessions.
- Current streak.
- Active task.
- Main focus timer.
- Recent sessions.
- A concise productivity summary derived from actual data.

Make the focus timer the visual centerpiece.

### C. Task manager
Implement working task creation, editing, deletion, completion, and selection.

Each task should support a title, optional description, priority, estimated duration, completion status, and creation time.

Persist changes locally.

### D. Focus timer
Implement a reliable timer with:
- A 25-minute default.
- Adjustable duration.
- Start, pause, resume, reset, finish, and cancel actions.
- Visible remaining time and progress.
- Session tracking.
- A completion screen.
- Correct behavior when the browser tab is backgrounded.

Calculate elapsed time from timestamps rather than trusting setInterval to fire exactly on time.

Prevent duplicate timers and invalid session records.

### E. Attention monitoring
Implement optional real browser-side computer vision using MediaPipe Tasks Vision.

When enabled:
- Request webcam permission.
- Display camera status and a small preview.
- Estimate face presence and coarse head orientation using supported model outputs.
- Smooth noisy results over time.
- Detect sustained potential look-away events using configurable thresholds.
- Provide understandable loading and error states.
- Allow the user to stop monitoring at any time.

Do not simulate detections. Do not claim to determine thoughts, emotions, or actual mental focus.

Do not store or upload raw video or webcam frames. Stop camera tracks when monitoring ends or the component unmounts.

If camera access or model loading fails, keep the rest of the application fully functional and explain the fallback.

### F. Distraction engine
Handle distinct events:
- Face missing for a sustained period.
- Likely prolonged head turn.
- Browser tab becoming hidden.
- Return from a prolonged hidden-tab interval.

Use smoothing, debouncing, cooldowns, timestamps, and duplicate-event prevention.

Only process relevant events during an active session.

The browser visibility API does not detect physical phone pickup or arbitrary desktop applications. Do not pretend it does.

### G. Roast engine and voice
Create a separate, typed roast-selection module.

Include at least 10 unique, curated roast messages for each intensity.

Examples:
- Mild: "Tiny detour. Your task is still waiting."
- Savage: "Your deadline is moving faster than your motivation."
- Unhinged: "Breaking news: the chair has completed more work than you."

Select messages according to event type, intensity, distraction count, and cooldown state.

Use browser SpeechSynthesis for spoken roasts. Support speech on/off, stop speech, voice selection when available, and graceful fallback when speech is unsupported.

Prevent overlapping speech and repeated messages. Do not autoplay unexpectedly or require paid API credentials.

### H. Chaos Mode
Create an optional mode with reversible, entertaining interruptions:
- An animated roast overlay.
- Surreal in-app warning cards.
- Dramatic countdown animations.
- Optional sound effects.
- Brief visual glitch effects.
- A clear return-to-focus action.

Provide an obvious disable control. Respect reduced-motion settings. Never force navigation, open embarrassing pages unexpectedly, destroy work, or trap the user in the interface.

### I. Gamification
Implement real session-based achievements:
- First Blood: first completed focus session.
- Locked In: complete a 25-minute session.
- Unbothered: complete a session with no detected distraction events.
- Redemption Arc: complete a task after multiple distraction events.

Prevent duplicate achievements. Track total focus time, completed sessions, completed tasks, distraction events, and streaks.

Do not describe these statistics as scientific proof of productivity.

### J. Analytics
Use Recharts to show actual persisted focus-session history and weekly focus time.

Display recent sessions, task completion statistics, distraction counts, and achievements.

Do not populate the charts with fabricated historical data. Provide a well-designed empty state for new users.

### K. Settings and accessibility
Allow users to change roast intensity, voice, sound, focus duration, camera monitoring, and Chaos Mode preferences.

Provide keyboard-accessible controls, visible focus indicators, reduced-motion support, responsive layouts, and clear permission errors.

## 5. CODE QUALITY

Keep components modular and business logic separate from presentation.

Suggested structure:

src/
  app/
  components/
  features/
    tasks/
    focus/
    attention/
    roasts/
    gamification/
    analytics/
  hooks/
  lib/
  types/
  tests/

Use strict TypeScript, reusable components, typed data structures, clean naming, and consistent formatting.

Create a central storage module with validation and error handling. Handle malformed localStorage data without crashing.

Avoid unnecessary abstractions and dependencies. Do not put the entire application into one giant React component.

## 6. TESTS AND VERIFICATION

Add essential tests for:
- Timer start, pause, resume, and reset.
- Timestamp-based elapsed-time calculations.
- Task creation and completion.
- Roast selection and cooldowns.
- Distraction event debouncing.
- Local persistence.
- Achievement awarding.

Mock browser-specific APIs in unit tests.

After implementation:
1. Install dependencies if necessary.
2. Run the production build.
3. Run available tests.
4. Fix actual TypeScript, build, and test errors.
5. Verify that the application runs using npm run dev.
6. Report any feature that remains incomplete rather than pretending it works.

## 7. README

Create README.md with:
- Project overview.
- Features.
- Technology stack.
- Installation instructions.
- Development and build commands.
- Testing instructions.
- Camera permission instructions.
- Privacy guarantees.
- Computer-vision limitations.
- Hackathon demo walkthrough.
- Known limitations.

Include an .env.example only if genuinely needed. Never commit secrets.

## 8. ACCEPTANCE CRITERIA

The result must:
- Start locally with documented commands.
- Build successfully.
- Support real task management.
- Have a reliable focus timer.
- Support optional, genuine computer vision when available.
- Provide working spoken roasts where supported.
- Record browser visibility events.
- Provide reversible Chaos Mode.
- Persist session data and settings.
- Display real analytics.
- Work without a webcam and without paid APIs.
- Handle permissions and errors gracefully.
- Look polished on desktop and mobile.

## 9. IMPLEMENTATION STRATEGY

Work in this order within the same task:
1. Establish the design system, layout, navigation, and task management.
2. Implement the focus timer and persistence.
3. Add the roast engine and speech.
4. Integrate actual computer vision and event detection.
5. Add Chaos Mode, achievements, and analytics.
6. Add tests, documentation, and final visual polish.

Do not repeatedly rebuild or redesign completed features. Reuse the existing implementation, keep the scope focused, and prefer simple working solutions.

If context or execution limits prevent completion in one pass, leave a working codebase, document what remains, and report the next concrete steps.

Start by inspecting the current workspace and then implement the project. Do not respond with only a plan.