import { ReactNode } from "react";

/**
 * Wraps a span of text with a hand-drawn red-pen underline (SVG path).
 * Used in place of <strong> or <em> to mark important words like an
 * editor's annotation. Subtle wiggle on the path = "drawn by hand".
 */
export default function InkUnderline({
  children,
  color = "var(--red-pen)",
  thickness = 2,
  underOffset = 2,
}: {
  children: ReactNode;
  color?: string;
  thickness?: number;
  underOffset?: number;
}) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        className="absolute left-0 w-full pointer-events-none"
        style={{ bottom: -underOffset, height: 6 }}
        viewBox="0 0 100 6"
        preserveAspectRatio="none"
      >
        <path
          d="M 1 4 Q 18 1 38 3 T 78 3 Q 90 4 99 2"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
