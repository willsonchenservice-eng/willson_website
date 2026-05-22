import { ReactNode } from "react";

/**
 * Margin annotation: small  serif (or handwritten) tilted text
 * positioned beside main content. Pretend it's been scribbled in the
 * margin of a notebook page.
 */
export default function Marginalia({
  children,
  side = "right",
  rotate = -3,
  className = "",
}: {
  children: ReactNode;
  side?: "left" | "right";
  rotate?: number;
  className?: string;
}) {
  return (
    <aside
      aria-hidden
      className={`hidden lg:block pointer-events-none select-none text-foreground/60 ${className}`}
      style={{
        fontFamily: "var(--font-hand)",
        fontSize: "1.15rem",
        lineHeight: 1.25,
        maxWidth: "11rem",
        transform: `rotate(${rotate}deg)`,
        textAlign: side === "left" ? "right" : "left",
      }}
    >
      {children}
    </aside>
  );
}
