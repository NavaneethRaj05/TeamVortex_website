import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation — triggers CSS animation class when element enters viewport.
 * Usage:
 *   const [ref, isVisible] = useScrollAnimation();
 *   <div ref={ref} className={isVisible ? 'animate-fade-up' : 'opacity-0'}>
 */
export const useScrollAnimation = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // fire once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

export default useScrollAnimation;
