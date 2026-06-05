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
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { Photo } from "@/lib/content";

const CLUSTER_MAX = 1200;
const TARGET_MEDIA_AREA = 30000;
const MIN_MEDIA_WIDTH = 128;
const MAX_MEDIA_WIDTH = 238;
const MIN_MEDIA_HEIGHT = 118;
const MAX_MEDIA_HEIGHT = 238;

const easeOut = [0.22, 1, 0.36, 1] as const;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getBalancedMediaSize(ratio: number) {
  const safeRatio = clamp(ratio || 1, 0.42, 2.4);
  let width = Math.sqrt(TARGET_MEDIA_AREA * safeRatio);
  let height = width / safeRatio;
  const scale = Math.min(
    MAX_MEDIA_WIDTH / width,
    MAX_MEDIA_HEIGHT / height,
    1
  );
  width *= scale;
  height *= scale;

  if (width < MIN_MEDIA_WIDTH) {
    width = MIN_MEDIA_WIDTH;
    height = width / safeRatio;
  }

  if (height < MIN_MEDIA_HEIGHT) {
    height = MIN_MEDIA_HEIGHT;
    width = height * safeRatio;
  }

  return {
    width: Math.round(clamp(width, MIN_MEDIA_WIDTH, MAX_MEDIA_WIDTH)),
    height: Math.round(clamp(height, MIN_MEDIA_HEIGHT, MAX_MEDIA_HEIGHT)),
  };
}

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
  const drift = 4 + (i % 3) * 3 + p.stringHeight * 0.04;
  const px = useTransform(mx, [-0.5, 0.5], [-drift, drift]);
  const py = useTransform(my, [-0.5, 0.5], [-drift * 0.55, drift * 0.55]);

  const initialMediaRatio = Math.max(1, p.width - 20) / Math.max(1, p.height);
  const [mediaRatio, setMediaRatio] = useState(initialMediaRatio);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const { width: mediaW, height: mediaH } = getBalancedMediaSize(mediaRatio);
  const cardW = mediaW + 20;

  const photoStyle: CSSProperties = {
    "--strh": `${p.stringHeight}px`,
    "--pw": `${cardW}px`,
    "--mw": `${mediaW}px`,
    "--mh": `${mediaH}px`,
  } as CSSProperties;

  const updateMediaRatio = (width: number, height: number) => {
    if (!width || !height) return;
    const nextRatio = width / height;
    setMediaRatio((prevRatio) =>
      Math.abs(prevRatio - nextRatio) < 0.001 ? prevRatio : nextRatio
    );
  };

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media instanceof HTMLVideoElement) {
      updateMediaRatio(media.videoWidth, media.videoHeight);
      return;
    }
    if (media.complete) {
      updateMediaRatio(media.naturalWidth, media.naturalHeight);
    }
  }, [p.src]);

  const isFront = p.zIndex >= 6;
  const isBack = p.zIndex <= 3;
  const depthShadow = isFront
    ? "0 28px 48px -16px rgba(0,0,0,0.36), 0 8px 16px -8px rgba(0,0,0,0.24)"
    : isBack
    ? "0 8px 18px -10px rgba(0,0,0,0.14), 0 2px 5px -3px rgba(0,0,0,0.08)"
    : "0 18px 32px -10px rgba(0,0,0,0.25), 0 4px 10px -6px rgba(0,0,0,0.18)";
  const depthFilter = isBack ? "saturate(0.92)" : undefined;

  const stringBulgeTable = [1.4, -1.8, 1.0, -2.0, 1.6, -1.2];
  const stringBulge = stringBulgeTable[i % stringBulgeTable.length];
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src);
  const isGif = /\.gif(?:$|\?)/i.test(p.src);
  const mediaFitClass = p.fit === "cover" ? "object-cover" : "object-contain";
  const mediaTransform = `${p.imageScale ? `scale(${p.imageScale}) ` : ""}translateZ(0)`;
  const mediaStyle: CSSProperties = {
    transform: mediaTransform,
    transformOrigin: p.imageScale ? "50% 0%" : undefined,
    backfaceVisibility: "hidden",
    willChange: "transform",
  };

  const card = (
    <div className="relative">
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

      <div
        className="absolute left-1/2 -translate-x-1/2 bg-white"
        style={{
          top: `calc(var(--strh) * var(--scale, 1))`,
          width: `calc(var(--pw) * var(--scale, 1))`,
          padding: `calc(10px * var(--scale, 1))`,
          paddingBottom: `calc(30px * var(--scale, 1))`,
          boxShadow: depthShadow,
          filter: depthFilter,
        }}
      >
        <div
          className="relative bg-line overflow-hidden"
          style={{
            width: `calc(var(--mw) * var(--scale, 1))`,
            height: `calc(var(--mh) * var(--scale, 1))`,
          }}
        >
          {isVideo ? (
            <video
              ref={mediaRef as RefObject<HTMLVideoElement>}
              src={p.src}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full ${mediaFitClass}`}
              style={mediaStyle}
              aria-label={p.caption}
              onLoadedMetadata={(event) =>
                updateMediaRatio(
                  event.currentTarget.videoWidth,
                  event.currentTarget.videoHeight
                )
              }
            />
          ) : isGif ? (
            <img
              ref={mediaRef as RefObject<HTMLImageElement>}
              src={p.src}
              alt={p.caption}
              decoding="async"
              loading={i < 3 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full ${mediaFitClass}`}
              style={mediaStyle}
              data-photowall-gif-loop="true"
              onLoad={(event) =>
                updateMediaRatio(
                  event.currentTarget.naturalWidth,
                  event.currentTarget.naturalHeight
                )
              }
            />
          ) : (
            <Image
              ref={mediaRef as RefObject<HTMLImageElement>}
              src={p.src}
              alt={p.caption}
              fill
              sizes={`${p.width}px`}
              loading={i < 3 ? "eager" : "lazy"}
              className={mediaFitClass}
              style={mediaStyle}
              unoptimized
              onLoad={(event) =>
                updateMediaRatio(
                  event.currentTarget.naturalWidth,
                  event.currentTarget.naturalHeight
                )
              }
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

  const hoverProps: any = reduced
    ? {}
    : {
        scale: 1.04,
        transition: { scale: { duration: 0.35, ease: "easeOut" } },
      };

  const innerW = Math.min(CLUSTER_MAX, viewportW);
  const innerLeft = (viewportW - innerW) / 2;
  const photoX = innerLeft + (innerW * p.leftPct) / 100;
  const t = viewportW > 0 ? photoX / viewportW : p.leftPct / 100;
  const sagPx = 160 * t * (1 - t);

  const controls = useAnimationControls();

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

  useEffect(() => {
    if (reduced || windTick === 0) return;
    const windDelay = (p.leftPct / 100) * 1.4;

    const windCenters = [25, 40, 50, 60, 75];
    const windCenter = windCenters[windTick % windCenters.length];

    const dist = Math.abs(p.leftPct - windCenter);
    const windAtPhoto = Math.exp(-(dist * dist) / (2 * 40 * 40));

    const pendFactor = 1 + p.stringHeight / 220;

    const massInvFactor = Math.sqrt(45000 / (p.width * p.height));

    const baseGust = 9;
    const gust = baseGust * windAtPhoto * pendFactor * massInvFactor;

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
