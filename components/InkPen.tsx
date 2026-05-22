"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ink-pen cursor: small triangular nib + trailing ink dot.
 * On hover over data-cursor-text or links/buttons it morphs into an ink-blot
 * pill. Hidden on touch devices (pointer: coarse).
 */
export default function InkPen() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (coarse) return;
    let raf = 0;
    let tx = -100,
      ty = -100,
      cx = -100,
      cy = -100;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) setVisible(true);
    };
    const tick = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) {
        setHovering(false);
        setLabel(null);
        return;
      }
      const node =
        t.closest<HTMLElement>("[data-cursor-text]") ||
        t.closest<HTMLElement>("a, button, [data-cursor='hover']");
      if (!node) {
        setHovering(false);
        setLabel(null);
        return;
      }
      const txt = node.getAttribute("data-cursor-text");
      setLabel(txt);
      setHovering(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [coarse, visible]);

  if (coarse) return null;

  const hasLabel = !!label;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-[60] flex items-center justify-center transition-[width,height,background-color,color,border-radius,opacity] duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      } ${
        hasLabel
          ? "w-20 h-20 rounded-full bg-[var(--red-pen)] text-white"
          : hovering
          ? "w-9 h-9 rounded-full bg-[var(--foreground)]"
          : "w-3 h-3 rounded-full bg-[var(--foreground)]"
      }`}
      style={{ willChange: "transform" }}
    >
      {hasLabel && (
        <span
          className="hand text-base leading-none -rotate-6"
          style={{ fontFamily: "var(--font-hand)" }}
        >
          {label} →
        </span>
      )}
    </div>
  );
}
