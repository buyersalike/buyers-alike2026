import { useState, useEffect, useRef } from "react";

export default function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const p = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
            setProgress(p);
          };
          window.addEventListener("scroll", handleScroll, { passive: true });
          handleScroll();
          return () => window.removeEventListener("scroll", handleScroll);
        }
      },
      { threshold: 0 }
    );

    observer.observe(element);
    
    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const p = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      setProgress(p);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { ref, progress };
}