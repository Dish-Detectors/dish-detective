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

    let cancelled = false;

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const startReveal = async () => {
      // Preload briefly so the utensil animation always has pixels to render.
      try {
        const fallback = new Promise<void>((r) => window.setTimeout(r, 900));
        await Promise.race([
          Promise.all([
            preloadImage("/fork.png"),
            preloadImage("/knife.png"),
          ]).then(() => undefined),
          fallback,
        ]);
      } catch {
        // Ignore preload failures; we still start the reveal.
      }

      if (cancelled) return;

      setVisible(true);

      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(REVEAL_ACTIVE_ATTR, "1");
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(REVEAL_START_EVENT));
      }
    };

    startReveal();

    return () => {
      cancelled = true;
    };
  }, [enabled, oncePerSession, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div className="ddReveal">
      <div
        className="ddReveal__scrim"
        aria-hidden="true"
        onAnimationEnd={() => {
          // When the scrim finishes fading out, remove the whole reveal.
          setVisible(false);
          if (typeof document !== "undefined") {
            document.documentElement.removeAttribute(REVEAL_ACTIVE_ATTR);
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(REVEAL_DONE_EVENT));
          }
          onDone?.();
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

      {/* Language choice and welcome message removed as per user request */}

      <style jsx>{`
        .ddReveal {
          position: fixed;
          inset: 0;
          z-index: 1500;
          pointer-events: none;
          overflow: hidden;
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
