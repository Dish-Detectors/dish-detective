"use client";
import React, { useEffect, useState } from "react";
import HomeRevealAnimation from "@/components/HomeRevealAnimation";

/**
 * Wraps homepage content, hiding it until the reveal animation completes,
 * then fades in children one by one.
 */
export default function HomeRevealGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    // Ensure initial render happens with opacity 0, then animate to 1.
    const raf = window.requestAnimationFrame(() => setAnimateIn(true));
    return () => window.cancelAnimationFrame(raf);
  }, [mounted]);

  // Hide all content until animation is done
  return (
    <>
      <HomeRevealAnimation onDone={() => setMounted(true)} />
      {mounted ? (
        <div
          className="ddHomeFadeGroup"
          aria-hidden={!animateIn}
          style={{
            pointerEvents: animateIn ? undefined : "none",
            opacity: animateIn ? 1 : 0,
            transition: "opacity 400ms cubic-bezier(.4,1,.4,1)",
          }}
        >
          {React.Children.map(children, (child, i) =>
            child ? (
              <div
                className="ddHomeFadeItem"
                style={{
                  opacity: animateIn ? 1 : 0,
                  transition: `opacity 600ms cubic-bezier(.4,1,.4,1) ${animateIn ? i * 120 : 0}ms`,
                  willChange: "opacity",
                }}
              >
                {child}
              </div>
            ) : null,
          )}
        </div>
      ) : null}
      <style jsx>{`
        .ddHomeFadeGroup {
          width: 100%;
          height: 100%;
        }
        .ddHomeFadeItem {
          width: 100%;
        }
      `}</style>
    </>
  );
}
