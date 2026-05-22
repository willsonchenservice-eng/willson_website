import { ReactNode } from "react";

/**
 * A rotated, double-bordered rubber stamp — useful for date stamps,
 * "READ", "DRAFT", "INDIE" markers. Defaults to red ink.
 */
export default function Stamp({
  children,
  color = "var(--red-pen)",
  rotate = -4,
  size = "sm",
  className = "",
}: {
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const padding =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : size === "md"
      ? "px-3 py-1.5 text-sm"
      : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-block font-semibold uppercase tracking-[0.18em] border-[1.5px] ${padding} ${className}`}
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate}deg)`,
        fontFamily: "var(--font-mono), ui-monospace",
        letterSpacing: "0.16em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
