"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const SOURCES = {
  light: "/backgrounds/utbk-light.mp4",
  dark: "/backgrounds/utbk-dark.mp4",
} as const;
type Mode = keyof typeof SOURCES;
const MODES: Mode[] = ["light", "dark"];

/** `true` on the server so no video is ever part of the server markup. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

function useSaveData() {
  return useSyncExternalStore(
    () => () => {},
    () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true,
    () => true,
  );
}

type Flags = Record<Mode, boolean>;
const NONE: Flags = { light: false, dark: false };

/**
 * One theme-aware background for the whole app, rendered once at the root next to the shell.
 *
 * - Purely visual: `position: fixed`, out of flow, `pointer-events: none` (see `.app-bg` in globals.css).
 * - Light mode plays /backgrounds/utbk-light.mp4, dark mode /backgrounds/utbk-dark.mp4.
 * - Only the active theme's video is requested; the other loads the first time that theme is used.
 * - A static CSS aurora sits underneath and crossfades with the theme, so a slow, missing or blocked
 *   video (or reduced motion / data saver) never shows a blank or white/black flash.
 */
export function AnimatedBackground() {
  const { resolvedTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const saveData = useSaveData();
  const mode: Mode | undefined = resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : undefined;

  // `shown` trails the theme by a moment: next-themes disables CSS transitions for the frame in
  // which it flips the attribute, so the crossfade must start just after that frame.
  const [shown, setShown] = useState<Mode>();
  const [requested, setRequested] = useState<Flags>(NONE);
  const [ready, setReady] = useState<Flags>(NONE);
  const [failed, setFailed] = useState<Flags>(NONE);
  const refs = useRef<Partial<Record<Mode, HTMLVideoElement | null>>>({});

  useEffect(() => {
    if (!mode || mode === shown) return;
    const t = setTimeout(
      () => {
        setShown(mode);
        setRequested((r) => ({ ...r, [mode]: true }));
      },
      shown === undefined ? 0 : 60,
    );
    return () => clearTimeout(t);
  }, [mode, shown]);

  // Play the visible video; pause the hidden one once its fade-out has finished (saves CPU/battery).
  useEffect(() => {
    if (!shown) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const m of MODES) {
      const el = refs.current[m];
      if (!el) continue;
      if (m === shown) void el.play().catch(() => {});
      else timers.push(setTimeout(() => el.pause(), 800));
    }
    return () => timers.forEach(clearTimeout);
  }, [shown, requested]);

  const videosEnabled = !reduced && !saveData;

  return (
    <div aria-hidden="true" className="app-bg" data-bg={shown}>
      <div className="app-bg__fallback app-bg__fallback--light" />
      <div className="app-bg__fallback app-bg__fallback--dark" />
      {videosEnabled &&
        MODES.map((m) =>
          requested[m] && !failed[m] ? (
            <video
              key={m}
              ref={(el) => {
                refs.current[m] = el;
              }}
              className="app-bg__video"
              data-active={shown === m && ready[m]}
              src={SOURCES[m]}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              tabIndex={-1}
              onLoadedData={() => setReady((r) => ({ ...r, [m]: true }))}
              onError={() => setFailed((f) => ({ ...f, [m]: true }))}
            />
          ) : null,
        )}
      <div className="app-bg__scrim" />
    </div>
  );
}
