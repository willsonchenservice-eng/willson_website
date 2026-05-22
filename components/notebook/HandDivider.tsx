/**
 * Hand-drawn squiggly horizontal divider used between sections.
 * Renders as a subtle wavy SVG line. Use sparingly to mark end-of-section.
 */
export default function HandDivider({
  color = "var(--foreground)",
  opacity = 0.35,
  width = "min(280px, 60%)",
  strokeWidth = 1.4,
  className = "",
  align = "center",
}: {
  color?: string;
  opacity?: number;
  width?: string;
  strokeWidth?: number;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div className={`w-full flex ${justify} ${className}`} aria-hidden>
      <svg
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        style={{ width, height: 10, opacity }}
        fill="none"
      >
        <path
          d="M 1 4 Q 12 1 24 4 T 48 4 T 72 4 T 96 4 T 119 4"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
