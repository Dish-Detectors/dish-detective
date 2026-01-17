"use client";

import React, { useEffect, useMemo, useState } from "react";

type HomeRevealAnimationProps = {
  /**
   * If false, the animation won't render.
   * Useful to disable during redirects or special flows.
   */
  enabled?: boolean;
  /**
   * If true, the animation will only play once per tab session.
   */
  oncePerSession?: boolean;
};

const SESSION_KEY = "dd_home_reveal_seen_v1";

export default function HomeRevealAnimation({
  enabled = true,
  oncePerSession = false,
}: HomeRevealAnimationProps) {
  const [visible, setVisible] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (prefersReducedMotion) return;

    if (oncePerSession) {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") return;
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // If storage is blocked, just play once per mount.
      }
    }

    setVisible(true);

    const totalMs = 1850;
    const timer = window.setTimeout(() => setVisible(false), totalMs);
    return () => window.clearTimeout(timer);
  }, [enabled, oncePerSession, prefersReducedMotion]);

  if (!visible) return null;

  return (
    <div className="ddReveal" aria-hidden="true">
      <div className="ddReveal__scrim" />

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
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.45) 60%,
            rgba(0, 0, 0, 0.65) 100%
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
          .ddReveal {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
