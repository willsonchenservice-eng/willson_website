/**
 * Decorative tape strip. Used to divide sections, attach photos,
 * or tag groups (B 端工作 / 独立项目).
 */
export default function WashiTape({
  color = "yellow",
  width = "100%",
  rotate = 0,
  label,
  className = "",
}: {
  color?: "yellow" | "mint" | "pink";
  width?: string | number;
  rotate?: number;
  label?: string;
  className?: string;
}) {
  const bg =
    color === "mint"
      ? "var(--tape-mint)"
      : color === "pink"
      ? "var(--sticky-pink)"
      : "var(--tape-yellow)";

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        background: bg,
        width: typeof width === "number" ? `${width}px` : width,
        height: "1.75rem",
        transform: `rotate(${rotate}deg)`,
        // subtle stripe to suggest washi pattern
        backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 4px, transparent 4px 12px), linear-gradient(${bg}, ${bg})`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {label && (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.18em] text-foreground/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
