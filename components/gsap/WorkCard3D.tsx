"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface WorkCard3DProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkCard3D({
  children,
  className = "",
}: WorkCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 24;
      const rotateY = (centerX - x) / 24;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.8,
        ease: "power1.out",
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 1.2,
        ease: "power2.out",
        transformPerspective: 1000,
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
