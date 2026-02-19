"use client";

import { useState, useEffect, useRef } from "react";

const IDLE_TIMEOUT = 20_000;
const MAX_EMOJIS = 108;
const EXIT_DURATION = 120;
const EXIT_RIPPLE_MAX = 300;

const EMOJIS = ["🪦"];

interface Sprite {
  id: number;
  emoji: string;
  left: number;
  size: number;
  rotate: number;
}

type Phase = "active" | "idle" | "exiting";

export function GraveyardIdle() {
  const [isMobile, setIsMobile] = useState(false);
  const [phase, setPhase] = useState<Phase>("active");
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [exitCursor, setExitCursor] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("active");
  const idRef = useRef(0);
  const spawnCountRef = useRef(0);
  const cursorRef = useRef({ x: 0, y: 0 });

  // Disable on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Track cursor position
  useEffect(() => {
    function onMove(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    }
    function onTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        cursorRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  // Activity detection and idle timer
  useEffect(() => {
    function startIdleTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        phaseRef.current = "idle";
        setPhase("idle");
      }, IDLE_TIMEOUT);
    }

    function onActivity() {
      if (phaseRef.current === "idle") {
        if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
        setExitCursor({ ...cursorRef.current });
        phaseRef.current = "exiting";
        setPhase("exiting");
      }
      if (phaseRef.current === "active") {
        startIdleTimer();
      }
    }

    const events = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true }),
    );
    startIdleTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, []);

  // Exiting → Active transition
  useEffect(() => {
    if (phase !== "exiting") return;
    const totalExit = EXIT_DURATION + EXIT_RIPPLE_MAX;
    exitTimerRef.current = setTimeout(() => {
      setSprites([]);
      phaseRef.current = "active";
      setPhase("active");
    }, totalExit);
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [phase]);

  // Restart idle timer when returning to active
  useEffect(() => {
    if (phase === "active" && sprites.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        phaseRef.current = "idle";
        setPhase("idle");
      }, IDLE_TIMEOUT);
    }
  }, [phase, sprites.length]);

  // Spawn emojis when idle
  useEffect(() => {
    if (phase !== "idle") return;

    function makeSprite(): Sprite {
      return {
        id: idRef.current++,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        left: Math.random() * 98 + 1,
        size: 0.9 + Math.random() * 0.7,
        rotate: Math.random() < 0.4 ? (Math.random() - 0.5) * 30 : 0,
      };
    }

    function spawnNext() {
      setSprites((prev) => {
        if (prev.length >= MAX_EMOJIS) return prev;
        return [...prev, makeSprite()];
      });

      const t = spawnCountRef.current++;
      const wave1 = Math.sin(t * 0.7);
      const wave2 = Math.sin(t * 1.3 + 2);
      const combined = (wave1 + wave2 + 2) / 4;
      const pause = 50 + (1 - combined) * 1650;
      spawnTimerRef.current = setTimeout(spawnNext, pause);
    }

    spawnNext();
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [phase]);

  if (isMobile) return null;
  if (phase === "active" && sprites.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {sprites.map((s) => {
        let animClass = "animate-graveyard-rise";
        let animDelay: number | undefined;

        if (phase === "exiting") {
          animClass = "animate-graveyard-sink";
          const spriteX = (s.left / 100) * window.innerWidth;
          const dx = spriteX - exitCursor.x;
          const dy = 56 - exitCursor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(
            window.innerWidth * window.innerWidth + 56 * 56,
          );
          animDelay = (dist / maxDist) * EXIT_RIPPLE_MAX;
        }

        return (
          <span
            key={s.id}
            className={`absolute bottom-0 leading-none ${animClass}`}
            style={{
              left: `${s.left}%`,
              fontSize: `${s.size}rem`,
              ...(s.rotate
                ? {
                    rotate: `${s.rotate}deg`,
                    marginBottom: `-${Math.abs(s.rotate) * 0.15}px`,
                  }
                : {}),
              ...(animDelay !== undefined
                ? { animationDelay: `${animDelay}ms` }
                : {}),
            }}
          >
            {s.emoji}
          </span>
        );
      })}
    </div>
  );
}
