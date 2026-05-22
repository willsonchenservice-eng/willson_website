/**
 * Small corner page number. Pure typography. Use in absolute corners
 * of pages or cards.
 */
export default function PageNumber({
  n,
  className = "",
}: {
  n: number | string;
  className?: string;
}) {
  return (
    <span
      className={`text-xs text-muted tabular-nums tracking-wider ${className}`}
      style={{ fontFamily: "var(--font-serif)", fontStyle: "" }}
    >
      — p. {n} —
    </span>
  );
}
