"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and a boolean indicating whether the element is in the viewport.
 * Once `triggerOnce` is true (default), stays true after first intersection.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "200px",
  triggerOnce = true,
}: { rootMargin?: string; triggerOnce?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (triggerOnce && inView)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, triggerOnce, inView]);

  return { ref, inView };
}
