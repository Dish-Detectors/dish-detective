"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  fadeIn?: boolean;
  fadeInDelayMs?: number;
  fadeInDurationSec?: number;
  staggerFadeIn?: boolean;
  staggerFadeInDelayMs?: number;
  staggerFadeInEachMs?: number;
  staggerFadeInDurationSec?: number;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, children, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
  depth: number;
}

const makeSlot = (
  i: number,
  distX: number,
  distY: number,
  total: number,
): Slot => ({
  x: Math.round(i * distX),
  y: Math.round(-i * distY),
  z: Math.round(-i * distX * 1.5),
  zIndex: total - i,
  depth: i,
});

const depthVisual = (depth: number) => {
  // depth=0 => front card
  // Increase fade + blur for back cards.
  const opacity = Math.max(0.5, 1 - depth * 0.2);
  const blurPx = depth * 1.8;
  return {
    opacity,
    filter: blurPx > 0 ? `blur(${blurPx}px)` : "none",
  };
};

const placeNow = (el: HTMLElement, slot: Slot, skew: number) => {
  const visual = depthVisual(slot.depth);
  return gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    opacity: visual.opacity,
    filter: visual.filter,
    force3D: true,
  });
};

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  fadeIn = false,
  fadeInDelayMs = 1500,
  fadeInDurationSec = 0.6,
  staggerFadeIn = false,
  staggerFadeInDelayMs = 1500,
  staggerFadeInEachMs = 140,
  staggerFadeInDurationSec = 0.5,
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardProps>[],
    [children],
  );
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr.length],
  );

  const order = useRef<number[]>(
    Array.from({ length: childArr.length }, (_, i) => i),
  );

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);
  const didIntroRef = useRef(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    if (staggerFadeIn) {
      gsap.set(node, { opacity: 1 });
      return;
    }

    if (!fadeIn) {
      gsap.set(node, { opacity: 1 });
      return;
    }

    gsap.set(node, { opacity: 0 });
    const tween = gsap.to(node, {
      opacity: 1,
      duration: fadeInDurationSec,
      delay: fadeInDelayMs / 1000,
      ease: "power2.out",
    });

    return () => {
      tween.kill();
    };
  }, [fadeIn, fadeInDelayMs, fadeInDurationSec]);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) =>
      placeNow(
        r.current!,
        makeSlot(i, cardDistance, verticalDistance, total),
        skewAmount,
      ),
    );

    if (staggerFadeIn && !didIntroRef.current) {
      didIntroRef.current = true;
      const cardEls = refs
        .map((r) => r.current)
        .filter(Boolean) as HTMLElement[];
      gsap.set(cardEls, { opacity: 0 });
      gsap.to(cardEls, {
        opacity: 1,
        duration: staggerFadeInDurationSec,
        delay: staggerFadeInDelayMs / 1000,
        stagger: staggerFadeInEachMs / 1000,
        ease: "power2.out",
      });
    }

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current!;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current!;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        const visual = depthVisual(slot.depth);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            opacity: visual.opacity,
            filter: visual.filter,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`,
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length,
      );
      const backVisual = depthVisual(backSlot.depth);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return",
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: backVisual.opacity,
          filter: backVisual.filter,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return",
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    // Start swapping after the configured delay so the initial card order is visible first.
    timeoutRef.current = window.setTimeout(() => {
      swap();
      intervalRef.current = window.setInterval(swap, delay);
    }, delay);

    if (pauseOnHover) {
      const node = container.current!;
      const pause = () => {
        tlRef.current?.pause();
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
        timeoutRef.current = window.setTimeout(() => {
          swap();
          intervalRef.current = window.setInterval(swap, delay);
        }, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
      };
    }
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          },
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child,
  );

  return (
    <div
      ref={container}
      className="card-swap-container"
      style={{ width, height, opacity: fadeIn && !staggerFadeIn ? 0 : 1 }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
