/**
 * SVG paperclip. Position absolutely above a corner of a photo/clip card.
 * Defaults to top-left, but you can rotate/translate via className/style.
 */
export default function PaperClip({
  size = 36,
  color = "#666",
  className = "",
  rotate = -18,
}: {
  size?: number;
  color?: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 40 60"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M 12 6 L 12 44 Q 12 54 20 54 Q 28 54 28 44 L 28 14 Q 28 8 22 8 Q 16 8 16 14 L 16 42" />
    </svg>
  );
}
