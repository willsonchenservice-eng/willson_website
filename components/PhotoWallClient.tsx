"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  useAnimationControls,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Photo } from "@/lib/content";

const CLUSTER_MAX = 1200;

const easeOut = [0.22, 1, 0.36, 1] as const;

function HangingPhoto({
  p,
  i,
  mx,
  my,
  reduced,
  viewportW,
  windTick,
}: {
  p: Photo;
  i: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  reduced: boolean;
  viewportW: number;
  windTick: number;
}) {
  // farther / longer string photos drift more — feels like depth + wind
  const drift = 4 + (i % 3) * 3 + p.stringHeight * 0.04;
  const px = useTransform(mx, [-0.5, 0.5], [-drift, drift]);
  const py = useTransform(my, [-0.5, 0.5], [-drift * 0.55, drift * 0.55]);

  const photoStyle: CSSProperties = {
    "--strh": `${p.stringHeight}px`,
    "--pw": `${p.width}px`,
    "--ph": `${p.height}px`,
  } as CSSProperties;

  // Spatial depth tiers based on zIndex:
  //   back  (z ≤ 3): light shadow + 0.5px blur + slight desaturation (atmospheric perspective)
  //   mid   (z 4–5): standard polaroid drop
  //   front (z ≥ 6): heavier shadow + subtle warm key light
  const isFront = p.zIndex >= 6;
  const isBack = p.zIndex <= 3;
  const depthShadow = isFront
    ? "0 28px 48px -16px rgba(0,0,0,0.36), 0 8px 16px -8px rgba(0,0,0,0.24)"
    : isBack
    ? "0 8px 18px -10px rgba(0,0,0,0.14), 0 2px 5px -3px rgba(0,0,0,0.08)"
    : "0 18px 32px -10px rgba(0,0,0,0.25), 0 4px 10px -6px rgba(0,0,0,0.18)";
  const depthFilter = isBack ? "blur(0.5px) saturate(0.92)" : undefined;

  // String bulge — a tiny lateral curve that varies per photo so each rope
  // looks individually hand-pinned, not machine-perfect.
  // Range roughly ±2 (px of bulge at mid-string, applied in viewBox units).
  const stringBulgeTable = [1.4, -1.8, 1.0, -2.0, 1.6, -1.2];
  const stringBulge = stringBulgeTable[i % stringBulgeTable.length];

  const card = (
    <div className="relative">
      {/* the string — SVG path with a gentle bulge for a "soft cord" feel */}
      <svg
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible"
        style={{
          width: 8,
          height: `calc(var(--strh) * var(--scale, 1))`,
        }}
        viewBox="0 0 8 100"
        preserveAspectRatio="none"
      >
        <path
          d={`M 4 0 Q ${4 + stringBulge} 50 4 100`}
          stroke="var(--foreground)"
          strokeOpacity="0.85"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* polaroid card hanging below the string */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-white"
        style={{
          top: `calc(var(--strh) * var(--scale, 1))`,
          width: `calc(var(--pw) * var(--scale, 1))`,
          padding: `calc(10px * var(--scale, 1))`,
          paddingBottom: `calc(30px * var(--scale, 1))`,
          // Depth-aware shadow: front photos cast deeper, back photos cast lighter
          boxShadow: depthShadow,
          // Subtle filter on background photos for atmospheric perspective
          filter: depthFilter,
        }}
      >
        <div
          className="relative bg-line overflow-hidden"
          style={{
            width: `calc((var(--pw) - 20px) * var(--scale, 1))`,
            height: `calc(var(--ph) * var(--scale, 1))`,
          }}
        >
          {/\.(mp4|webm|mov)$/i.test(p.src) ? (
            <video
              src={p.src}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              aria-label={p.caption}
            />
          ) : (
            <Image
              src={p.src}
              alt={p.caption}
              fill
              sizes={`${p.width}px`}
              className={p.fit === "contain" ? "object-contain" : "object-cover"}
              style={p.imageScale ? { transform: `scale(${p.imageScale})` } : undefined}
              unoptimized
            />
          )}
        </div>
        <div
          className="absolute left-0 right-0 text-center serif text-foreground/80"
          style={{
            bottom: `calc(8px * var(--scale, 1))`,
            fontSize: `calc(13px * var(--scale, 1))`,
          }}
        >
          {p.caption}
        </div>
      </div>
    </div>
  );

  // Hover: just a subtle lift + scale to signal "interactive".
  // No rotate wiggle — hovering a photo doesn't physically make it sway,
  // and the previous keyframe swing made the wall feel unstable.
  const hoverProps: any = reduced
    ? {}
    : {
        scale: 1.04,
        transition: { scale: { duration: 0.35, ease: "easeOut" } },
      };

  // Wire spans full viewport; photos cluster inside an inner CLUSTER_MAX-wide
  // container. So leftPct (relative to inner) is NOT the same as the wire's
  // parametric t (which is photo_x / viewport_w). Compute the photo's actual
  // viewport-x, then derive sag from the wire's path: 160·t·(1−t).
  const innerW = Math.min(CLUSTER_MAX, viewportW);
  const innerLeft = (viewportW - innerW) / 2;
  const photoX = innerLeft + (innerW * p.leftPct) / 100;
  const t = viewportW > 0 ? photoX / viewportW : p.leftPct / 100;
  const sagPx = 160 * t * (1 - t);

  // Imperative animation controls so we can run entrance once, then react to
  // wind ticks afterwards.
  const controls = useAnimationControls();

  // Entrance: pin stays on the wire, photo swings from rotate 0 to rest with a
  // spring. Runs once after mount.
  useEffect(() => {
    if (reduced) {
      controls.set({ opacity: 1, rotate: p.rotate });
      return;
    }
    controls.start({
      opacity: 1,
      rotate: p.rotate,
      transition: {
        opacity: { delay: 0.2 + i * 0.16, duration: 0.4, ease: easeOut },
        rotate: {
          delay: 0.2 + i * 0.16,
          type: "spring",
          stiffness: 65,
          damping: 8,
          mass: 0.75,
        },
      },
    });
  }, [controls, p.rotate, i, reduced]);

  // Wind: every windTick increment, a gust sweeps the wall L→R. Each photo's
  // swing amplitude is the product of three physical factors:
  //   • W(x) — wind strength at this photo's leftPct (Gaussian around a center
  //            that wanders per-gust, so the wind isn't uniform)
  //   • P(L) — pendulum length factor (longer string → wider amplitude)
  //   • 1/M  — inverse mass (bigger / heavier photo → smaller amplitude)
  useEffect(() => {
    if (reduced || windTick === 0) return;
    const windDelay = (p.leftPct / 100) * 1.4;

    // Each gust peaks somewhere different across the wall.
    const windCenters = [25, 40, 50, 60, 75];
    const windCenter = windCenters[windTick % windCenters.length];

    // 1. Wind strength at photo's x (Gaussian, σ≈40 in leftPct units).
    const dist = Math.abs(p.leftPct - windCenter);
    const windAtPhoto = Math.exp(-(dist * dist) / (2 * 40 * 40));

    // 2. Pendulum length factor (longer string → wider swing).
    const pendFactor = 1 + p.stringHeight / 220;

    // 3. Inverse-mass factor (smaller area → bigger swing). Normalized to ~1
    //    at a 45,000 px² area; ranges roughly 0.9 (heavy) – 1.1 (light) here.
    const massInvFactor = Math.sqrt(45000 / (p.width * p.height));

    const baseGust = 9; // raw wind intensity in degrees
    const gust = baseGust * windAtPhoto * pendFactor * massInvFactor;

    // Wind ramps up fast then fades. Photo has inertia — so after the wind
    // dies, the photo's returning momentum carries it past rest (overshoots
    // LEFT briefly) before damping back.
    controls.start({
      rotate: [
        p.rotate,
        p.rotate - gust,
        p.rotate + gust * 0.22,
        p.rotate,
      ],
      transition: {
        delay: windDelay,
        duration: 1.8,
        ease: ["easeOut", "easeInOut", "easeInOut"],
        times: [0, 0.13, 0.58, 1],
      },
    });
  }, [
    windTick,
    controls,
    p.rotate,
    p.leftPct,
    p.stringHeight,
    p.width,
    p.height,
    reduced,
  ]);

  return (
    <motion.div
      className={`absolute ${p.hideOnMobile ? "hidden sm:block" : ""}`}
      style={{
        top: `calc(var(--wire-y, 76px) + ${sagPx}px)`,
        left: `${p.leftPct}%`,
        zIndex: p.zIndex,
        x: reduced ? 0 : px,
        y: reduced ? 0 : py,
        ...photoStyle,
      }}
      whileHover={reduced ? undefined : { zIndex: 30 }}
      transition={{ zIndex: { duration: 0 } }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-[33%] z-20"
      >
        <div
          className="bg-foreground rounded-[2px] shadow-[0_1px_0_rgba(0,0,0,0.4)]"
          style={{
            width: `calc(10px * var(--scale, 1))`,
            height: `calc(13px * var(--scale, 1))`,
          }}
        />
      </div>

      <motion.div
        className="relative"
        style={{ transformOrigin: "50% 0%" }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={controls}
        whileHover={hoverProps}
        whileTap={reduced ? undefined : { scale: 0.98 }}
      >
        {p.href ? (
          <Link
            href={p.href}
            data-cursor-text="VIEW"
            className="block cursor-pointer"
          >
            {card}
          </Link>
        ) : (
          card
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PhotoWallClient({ photos }: { photos: Photo[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  const [viewportW, setViewportW] = useState<number>(CLUSTER_MAX);
  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [windTick, setWindTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const start = window.setTimeout(() => {
      intervalId = setInterval(() => setWindTick((t) => t + 1), 8000);
    }, 3500);
    return () => {
      window.clearTimeout(start);
      if (intervalId) clearInterval(intervalId);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      mx.set(Math.max(-0.5, Math.min(0.5, x)));
      my.set(Math.max(-0.5, Math.min(0.5, y)));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduced]);

  return (
    <div
      className="photo-wall relative w-full overflow-hidden"
      style={{ height: "var(--wall-h, 540px)" }}
    >
      <svg
        aria-hidden
        className="absolute left-0 right-0 w-full pointer-events-none text-foreground/85"
        style={{ top: `calc(var(--wire-y, 76px) - 4px)`, height: 50 }}
        viewBox="0 0 1000 50"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 4 Q 500 84 1000 4"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>

      <div
        ref={ref}
        className="relative mx-auto h-full"
        style={{ maxWidth: CLUSTER_MAX }}
      >
        {photos.map((p, i) => (
          <HangingPhoto
            key={p.caption}
            p={p}
            i={i}
            mx={smx}
            my={smy}
            reduced={reduced}
            viewportW={viewportW}
            windTick={windTick}
          />
        ))}
      </div>
    </div>
  );
}
