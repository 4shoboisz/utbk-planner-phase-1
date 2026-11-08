# Animated backgrounds

Place the two video files here, with exactly these names:

- `utbk-light.mp4` — shown in light mode
- `utbk-dark.mp4`  — shown in dark mode

They are served at `/backgrounds/utbk-light.mp4` and `/backgrounds/utbk-dark.mp4`.

Until a file exists the app shows a static CSS aurora instead and nothing breaks.

Recommendations: H.264 MP4, no audio track needed (it plays muted), 1920×1080 or smaller,
a seamless loop of 10–20 s, and ideally under ~4 MB so mobile loads stay light. Keep the
footage soft and low-contrast; UI text sits on glass above it.
