"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 80;
const MAX_PULL = 128;
const ANGLE_LIMIT = 30; // degrees — ignore mostly-horizontal swipes

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const pulling = useRef(false);
  const locked = useRef(false); // locked = gesture rejected (horizontal swipe)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (refreshing) return;
      if (window.scrollY > 0) return;

      // Don't activate inside independently scrollable containers
      let el = e.target as HTMLElement | null;
      while (el && el !== document.documentElement) {
        if (el.scrollTop > 0) return;
        el = el.parentElement;
      }

      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      pulling.current = false;
      locked.current = false;
    },
    [refreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (refreshing || locked.current) return;
      if (window.scrollY > 0) {
        pulling.current = false;
        setPullDistance(0);
        return;
      }

      const dy = e.touches[0].clientY - startY.current;
      const dx = e.touches[0].clientX - startX.current;

      // On first meaningful movement, decide if this is a vertical gesture
      if (!pulling.current && !locked.current) {
        const absDy = Math.abs(dy);
        const absDx = Math.abs(dx);
        if (absDy < 4 && absDx < 4) return; // too small to decide
        const angle = Math.atan2(absDx, absDy) * (180 / Math.PI);
        if (angle > ANGLE_LIMIT) {
          locked.current = true;
          return;
        }
        if (dy <= 0) return; // upward swipe
        pulling.current = true;
      }

      if (pulling.current && dy > 0) {
        // Dampen the pull so it feels spring-like
        const dampened = Math.min(dy * 0.5, MAX_PULL);
        setPullDistance(dampened);
        if (dampened > 10) e.preventDefault();
      }
    },
    [refreshing],
  );

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) {
      setPullDistance(0);
      return;
    }
    pulling.current = false;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      window.location.reload();
    } else {
      setPullDistance(0);
    }
  }, [pullDistance]);

  useEffect(() => {
    // Only attach on touch-capable devices
    if (!("ontouchstart" in window)) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (pullDistance === 0 && !refreshing) return null;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex justify-center"
      style={{ transform: `translateY(${pullDistance - 40}px)` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg ring-1 ring-border">
        <RefreshCw
          className={`h-5 w-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  );
}
