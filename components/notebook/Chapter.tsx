import { ReactNode } from "react";
import Doodle from "./Doodle";

/**
 * Notebook chapter header. Used to divide major sections. Smaller and
 * more restrained than the old SectionTitle — feels like a printed tab
 * page inside a notebook, not a magazine cover.
 */
export default function Chapter({
  index,
  kicker,
  title,
  meta,
  arrow = true,
  titleFontFamily,
  titleLineHeight,
}: {
  index?: string;       // 'Ⅱ' or '02'
  kicker?: string;      // "Notebook"
  title: ReactNode;
  meta?: ReactNode;
  arrow?: boolean;
  titleFontFamily?: string;
  titleLineHeight?: string;
}) {
  return (
    <header className="relative pt-12 pb-6">
      {(index || kicker) && (
        <div className="flex items-baseline gap-3 mb-3">
          {index && (
            <span
              className="text-[var(--red-pen)] tabular-nums text-sm tracking-[0.22em] font-mono"
              style={{ letterSpacing: "0.22em" }}
            >
              Ch · {index}
            </span>
          )}
          {kicker && (
            <span className="text-muted uppercase tracking-[0.22em] text-xs">
              {kicker}
            </span>
          )}
        </div>
      )}
      <h1
        className="tracking-[-0.02em] leading-[0.95]"
        style={{
          fontFamily: titleFontFamily || 'Helvetica, "Courier New", Courier, monospace',
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          ...(titleLineHeight ? { lineHeight: titleLineHeight } : {}),
        }}
      >
        {title}
        {arrow && (
          <Doodle
            kind="arrow-down"
            size={42}
            color="var(--red-pen)"
            className="inline-block ml-3 align-middle -translate-y-1"
          />
        )}
      </h1>
      {meta && <div className="text-muted text-sm mt-3 w-full">{meta}</div>}
    </header>
  );
}
