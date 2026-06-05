"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface HeroTimelineProps {
  children: React.ReactNode;
}

export default function HeroTimeline({ children }: HeroTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (greetingRef.current) {
      tl.fromTo(
        greetingRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
      );
    }

    if (nameRef.current) {
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 24, rotate: -4 },
        { opacity: 1, y: 0, rotate: -1.5, duration: 1.0, ease: "elastic.out(1, 0.5)" },
        "-=0.5"
      );
    }

    if (bioRef.current) {
      tl.fromTo(
        bioRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );
    }

    if (stickyRef.current) {
      tl.fromTo(
        stickyRef.current,
        { opacity: 0, y: 24, rotate: -6 },
        { opacity: 1, y: 0, rotate: 2.4, duration: 1.0, ease: "elastic.out(1, 0.4)" },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
