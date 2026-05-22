"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { WorkMeta } from "@/lib/content";
import Doodle from "@/components/notebook/Doodle";

/**
 * Clean rounded-rectangle work card with a few light notebook touches:
 *   - Slight per-card tilt (hand-placed feel)
 *   - Tiny tape strip at top-left corner
 *   - Eyebrow row: tag · year
 *   - Cover image with rounded corners
 *   - Italic-serif title, printed-body summary
 *   - Small red doodle in bottom-right as a flourish
 * Hover lifts the card and deepens shadow.
 */

const TILTS = [-0.7, 0.5, -0.4, 0.6, -0.5, 0.4];
const TAPE_COLORS = [
  "var(--tape-yellow)",
  "var(--tape-mint)",
  "var(--sticky-pink)",
];
const DOODLES: ("asterisk" | "star" | "scribble")[] = [
  "asterisk",
  "star",
  "scribble",
];

export default function WorkCard({
  work,
  index = 0,
}: {
  work: WorkMeta;
  index?: number;
  // legacy prop, ignored
  flip?: boolean;
}) {
  const cover = work.cover;
  const tilt = TILTS[index % TILTS.length];
  const tapeColor = TAPE_COLORS[index % TAPE_COLORS.length];
  const doodleKind = DOODLES[index % DOODLES.length];
  const tagPrimary = work.tags?.[0] ?? "Work";
  const subTags = (work.tags ?? []).slice(1);
  const coverFit = work.coverFit ?? "cover";
  const coverAspect = work.coverAspect ?? "16 / 10";

  return (
    <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.6,
          delay: index * 0.04,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transform: `rotate(${tilt}deg)` }}
        className="relative will-change-transform"
      >
        <Link
          href={`/work/${work.slug}`}
          data-cursor-text="READ"
          className="group relative block overflow-hidden rounded-2xl bg-white border-[8px] border-[var(--line)] shadow-[0_8px_22px_-12px_rgba(0,0,0,0.16)] transition-all duration-500 ease-out"
        >
        {/* small piece of tape at top-left — peeks out of the corner */}
        <span
          aria-hidden
          className="absolute top-3 left-3 z-10 pointer-events-none"
          style={{
            width: 38,
            height: 12,
            background: tapeColor,
            opacity: 0.78,
            transform: "rotate(-8deg)",
            backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 8px), linear-gradient(${tapeColor}, ${tapeColor})`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            borderRadius: 1,
          }}
        />

        {/* cover image — top of card, sharp edges below */}
        {cover && (
          <div
            className="relative overflow-hidden bg-line"
            style={{ aspectRatio: coverAspect }}
          >
            <Image
              src={cover}
              alt={work.title}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              className={`${coverFit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-[400ms] ease-out group-hover:scale-[1.08]`}
              unoptimized
            />
          </div>
        )}

        {/* content */}
        <div className="px-5 pt-4 pb-5">
          {/* title */}
          <h3
            className="leading-[1.15] tracking-[-0.01em] mb-2"
            style={{ 
              fontSize: "clamp(1.4rem, 1.9vw, 1.65rem)",
              fontFamily: 'Helvetica, "Courier New", Courier, monospace'
            }}
          >
            {work.title}
          </h3>

          {/* summary */}
          <p className="text-[0.86rem] text-muted leading-[1.55] line-clamp-2 mb-3">
            {work.summary}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
