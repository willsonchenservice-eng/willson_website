/**
 * Hand-drawn SVG doodles used as flourishes. Each variant is a single
 * <svg> with subtle wobble so it reads as "drawn", not "computer-vector".
 */
export type DoodleKind =
  | "arrow-right"
  | "arrow-down"
  | "arrow-curve"
  | "star"
  | "asterisk"
  | "underline-wave"
  | "circle"
  | "scribble";

export default function Doodle({
  kind = "arrow-right",
  size = 32,
  color = "currentColor",
  className = "",
  strokeWidth = 1.6,
}: {
  kind?: DoodleKind;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (kind) {
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M 4 21 Q 18 17 33 22" />
          <path d="M 27 16 Q 32 21 33 22 Q 30 25 26 28" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common}>
          <path d="M 19 4 Q 22 18 20 33" />
          <path d="M 13 28 Q 19 33 20 33 Q 24 30 27 26" />
        </svg>
      );
    case "arrow-curve":
      return (
        <svg {...common}>
          <path d="M 4 8 Q 4 28 28 32" />
          <path d="M 22 27 Q 28 31 28 32 Q 25 35 22 38" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M 20 5 L 23 16 L 35 17 L 25 24 L 28 36 L 20 30 L 12 36 L 15 24 L 5 17 L 17 16 Z" />
        </svg>
      );
    case "asterisk":
      return (
        <svg {...common}>
          <path d="M 20 6 L 20 34 M 8 13 L 32 27 M 8 27 L 32 13" />
        </svg>
      );
    case "underline-wave":
      return (
        <svg {...common} viewBox="0 0 60 12">
          <path d="M 2 8 Q 12 2 22 6 T 42 6 Q 52 9 58 5" />
        </svg>
      );
    case "circle":
      return (
        <svg {...common}>
          <path d="M 8 20 Q 10 7 22 6 Q 34 6 34 19 Q 33 33 19 33 Q 6 32 6 21" />
        </svg>
      );
    case "scribble":
      return (
        <svg {...common}>
          <path d="M 5 22 Q 10 12 18 18 Q 26 26 30 16 Q 33 8 36 18" />
        </svg>
      );
  }
}
