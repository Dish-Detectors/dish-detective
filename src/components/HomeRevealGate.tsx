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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animation duration in ms (keep in sync with HomeRevealAnimation)
    const timeout = setTimeout(() => setShowContent(true), 1850);
    return () => clearTimeout(timeout);
  }, []);

  // Hide all content until animation is done
  return (
    <>
      <HomeRevealAnimation />
      <div
        className="ddHomeFadeGroup"
        aria-hidden={!showContent}
        style={{
          pointerEvents: showContent ? undefined : "none",
          opacity: showContent ? 1 : 0,
          transition: "opacity 400ms cubic-bezier(.4,1,.4,1)",
        }}
      >
        {React.Children.map(children, (child, i) =>
          child ? (
            <div
              className="ddHomeFadeItem"
              style={{
                opacity: showContent ? 1 : 0,
                transition: `opacity 600ms cubic-bezier(.4,1,.4,1) ${showContent ? i * 120 : 0}ms`,
                willChange: "opacity",
              }}
            >
              {child}
            </div>
          ) : null,
        )}
      </div>
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
