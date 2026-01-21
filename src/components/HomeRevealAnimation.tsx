"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type HomeRevealAnimationProps = {
  // If false, the animation won't render.
  enabled?: boolean;
  // If true, the animation will only play once per tab session.
  oncePerSession?: boolean;
  // Called when the reveal is fully finished.
  onDone?: () => void;
};

const SESSION_KEY = "dd_home_reveal_seen_v1";
const LANG_KEY = "dd_lang_v1";
const REVEAL_ACTIVE_ATTR = "data-dd-home-reveal";
const REVEAL_START_EVENT = "dd:homeRevealStart";
const REVEAL_DONE_EVENT = "dd:homeRevealDone";

export default function HomeRevealAnimation({
  enabled = true,
  oncePerSession = false,
  onDone,
}: HomeRevealAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showLanguageChoice, setShowLanguageChoice] = useState(false);
  const [welcomeText, setWelcomeText] = useState<string | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  const pauseTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const welcomeFadeTimerRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(REVEAL_DONE_EVENT));
      }
      onDone?.();
      return;
    }

    if (oncePerSession) {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
          if (typeof document !== "undefined") {
            document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(REVEAL_DONE_EVENT));
          }
          onDone?.();
          return;
        }
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // If storage is blocked, just play once per mount.
      }
    }

    setVisible(true);

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(REVEAL_ACTIVE_ATTR, "1");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(REVEAL_START_EVENT));
    }

    // For reduced motion, skip animation and ask for language immediately.
    if (prefersReducedMotion) {
      setPaused(true);
      setShowLanguageChoice(true);
      return;
    }

    // Pause shortly after the fly-in reaches center (≈42% of 1650ms).
    const pauseMs = 700;
    pauseTimerRef.current = window.setTimeout(() => {
      setPaused(true);
      setShowLanguageChoice(true);
    }, pauseMs);

    return () => {
      if (pauseTimerRef.current != null) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      if (resumeTimerRef.current != null) {
        window.clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (welcomeFadeTimerRef.current != null) {
        window.clearTimeout(welcomeFadeTimerRef.current);
        welcomeFadeTimerRef.current = null;
      }
    };
  }, [enabled, oncePerSession, prefersReducedMotion]);

  const chooseLanguage = (lang: "HR" | "EN") => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }

    if (pauseTimerRef.current != null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }

    if (welcomeFadeTimerRef.current != null) {
      window.clearTimeout(welcomeFadeTimerRef.current);
      welcomeFadeTimerRef.current = null;
    }

    setShowLanguageChoice(false);

    // Reduced motion: no animation to resume, just finish.
    if (prefersReducedMotion) {
      setVisible(false);
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(REVEAL_DONE_EVENT));
      }
      onDone?.();
      return;
    }

    // Keep the animation paused briefly and show a small message in place of buttons,
    // then resume the CSS animation.
    const message = lang === "HR" ? "Dobrodošli!" : "Welcome!";
    setWelcomeText(message);
    setWelcomeVisible(false);

    window.requestAnimationFrame(() => {
      setWelcomeVisible(true);
      setPaused(false);
    });

    // Utensils fade begins at 78% of their 1650ms animation.
    // We paused at ~700ms (≈42%), so the time from resume -> fade-start is:
    // 1650*0.78 - 700 ≈ 587ms
    const fadeOutStartMs = Math.max(0, Math.round(1650 * 0.78 - 700));
    const fadeOutMs = 220;

    resumeTimerRef.current = window.setTimeout(() => {
      setWelcomeVisible(false);
      welcomeFadeTimerRef.current = window.setTimeout(() => {
        setWelcomeText(null);
        welcomeFadeTimerRef.current = null;
      }, fadeOutMs);
      resumeTimerRef.current = null;
    }, fadeOutStartMs);
  };

  if (!visible) return null;

  return (
    <div className={paused ? "ddReveal ddReveal--paused" : "ddReveal"}>
      <div
        className="ddReveal__scrim"
        aria-hidden="true"
        onAnimationEnd={() => {
          // When the scrim finishes fading out, remove the whole reveal.
          if (!paused) {
            setVisible(false);
            if (typeof document !== "undefined") {
              document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event(REVEAL_DONE_EVENT));
            }
            onDone?.();
          }
        }}
      />

      <img
        className="ddUtensil ddUtensil--fork"
        src="/fork.png"
        alt=""
        draggable={false}
      />
      <img
        className="ddUtensil ddUtensil--knife"
        src="/knife.png"
        alt=""
        draggable={false}
      />

      {showLanguageChoice ? (
        <div className="ddLang" role="group" aria-label="Choose language">
          <button
            type="button"
            className="ddLang__btn"
            onClick={() => chooseLanguage("HR")}
            aria-label="Hrvatski"
          >
            <img
              className="ddLang__flag"
              src="/HR.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            HR
          </button>
          <div className="ddLang__sep" aria-hidden="true" />
          <button
            type="button"
            className="ddLang__btn"
            onClick={() => chooseLanguage("EN")}
            aria-label="English"
          >
            <img
              className="ddLang__flag"
              src="/GB.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            EN
          </button>
        </div>
      ) : welcomeText ? (
        <div className="ddLang ddLang--msg" aria-live="polite">
          <div
            className={
              welcomeVisible ? "ddLang__msg ddLang__msg--in" : "ddLang__msg"
            }
          >
            {welcomeText}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .ddReveal {
          position: fixed;
          inset: 0;
          z-index: 1500;
          pointer-events: none;
          overflow: hidden;
        }

        .ddReveal--paused .ddReveal__scrim,
        .ddReveal--paused .ddUtensil--fork,
        .ddReveal--paused .ddUtensil--knife {
          animation-play-state: paused;
        }

        .ddReveal__scrim {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(0, 0, 0, 0.42) 0%,
            rgba(0, 0, 0, 0.68) 60%,
            rgba(0, 0, 0, 0.86) 100%
          );
          animation: ddScrimFade 1850ms ease-in-out forwards;
        }

        .ddUtensil {
          position: absolute;
          left: 50%;
          top: 50%;
          width: clamp(140px, 16vw, 220px);
          height: auto;
          transform-origin: 50% 50%;
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.15));
          user-select: none;
        }

        .ddUtensil--fork {
          transform: translate(-50%, -50%) scale(1.12);
          animation: ddForkMove 1650ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .ddUtensil--knife {
          transform: translate(-50%, -50%) scaleX(-1) scale(1.12);
          animation: ddKnifeMove 1650ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .ddLang {
          position: absolute;
          left: 50%;
          top: calc(50% + clamp(92px, 10vw, 140px));
          transform: translateX(-50%);
          display: flex;
          gap: 0;
          pointer-events: auto;
          z-index: 2;
        }

        .ddLang--msg {
          pointer-events: none;
        }

        .ddLang__msg {
          font-family: inherit;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          letter-spacing: 0.08em;
          font-size: clamp(20px, 2.2vw, 26px);
          text-shadow:
            0 2px 2px rgba(0, 0, 0, 0.9),
            0 6px 18px rgba(0, 0, 0, 0.85),
            0 10px 34px rgba(0, 0, 0, 0.7);
          opacity: 0;
          transition: opacity 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: opacity;
        }

        .ddLang__msg--in {
          opacity: 1;
        }

        .ddLang__sep {
          width: 0;
          height: 34px;
          border-left: 2px dashed rgba(255, 255, 255, 0.55);
          opacity: 0.9;
          align-self: center;
          margin: 0 16px;
        }

        .ddLang__btn {
          appearance: none;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 10px 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          min-width: 74px;
          backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ddLang__flag {
          width: 18px;
          height: 18px;
          display: inline-block;
          object-fit: contain;
          border-radius: 3px;
        }

        .ddLang__btn:hover {
          background: rgba(0, 0, 0, 0.55);
        }

        .ddLang__btn:active {
          transform: translateY(1px);
        }

        @keyframes ddForkMove {
          0% {
            transform: translate(calc(-50% - 60vw), calc(-50% - 60vh))
              scale(1.2);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          42% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1.12);
          }
          78% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes ddKnifeMove {
          0% {
            transform: translate(calc(-50% + 60vw), calc(-50% - 60vh))
              scaleX(-1) scale(1.2);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          42% {
            transform: translate(-50%, -50%) rotate(0deg) scaleX(-1) scale(1.12);
          }
          78% {
            transform: translate(-50%, -50%) scaleX(-1) scale(1.12);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scaleX(-1) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes ddScrimFade {
          0% {
            opacity: 0;
          }
          16% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ddReveal__scrim {
            animation: none;
            opacity: 1;
          }

          .ddUtensil--fork,
          .ddUtensil--knife {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
