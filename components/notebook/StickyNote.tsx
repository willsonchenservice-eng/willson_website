import { ReactNode } from "react";

/**
 * Yellow / pink post-it square. Slight rotation, drop shadow, can hold
 * a header + body content.
 */
export default function StickyNote({
  children,
  color = "yellow",
  rotate = -2,
  className = "",
}: {
  children: ReactNode;
  color?: "yellow" | "pink" | "mint";
  rotate?: number;
  className?: string;
}) {
  const bg =
    color === "pink"
      ? "var(--sticky-pink)"
      : color === "mint"
      ? "var(--tape-mint)"
      : "var(--sticky-yellow)";

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        background: bg,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          "0 8px 18px -6px rgba(0,0,0,0.18), 0 2px 4px -2px rgba(0,0,0,0.12)",
        padding: "1.25rem 1.25rem 1.5rem 1.25rem",
        minWidth: "12rem",
      }}
    >
      {/* tiny corner curl for that "stuck-on" feel */}
      <span
        aria-hidden
        className="absolute top-0 right-0 w-3 h-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.06) 0%, transparent 50%)",
        }}
      />
      {children}
    </div>
  );
}
