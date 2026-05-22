"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Doodle from "@/components/notebook/Doodle";

export interface SocialPost {
  /** Path to the local mp4 (or other browser-playable source). */
  src: string;
  /** Link to the original post on the platform. */
  href: string;
  /** Title as it appears on the platform — wrapped in 「」 visually. */
  postTitle: string;
  /** 1–3 sentence body. Why this post exists, what it's about. */
  body: string;
  poster?: string;
  /** CSS aspect-ratio string, e.g. "9/16" or "16/9". Defaults to "16/9". */
  aspectRatio?: string;
}

/**
 * SocialEmbed — a row of "polaroid"-style posts from a social platform.
 * Each post is a vertical card:
 *   • large tilted+taped video frame on top (auto-plays muted preview on
 *     hover/focus). Click → opens a fullscreen lightbox player.
 *   • short caption below: title + body + tiny CTA (de-emphasized).
 *
 * The lightbox plays the same mp4 unmuted with native controls.
 */

const TILTS = [-1.6, 1.2, -1.0, 1.4];
const TAPES = ["var(--tape-mint)", "var(--tape-yellow)", "var(--sticky-pink)"];

export default function SocialEmbed({
  posts,
  platform = "小红书",
  videoMaxWidth = 460,
}: {
  posts: SocialPost[];
  platform?: string;
  /** Max width of each video frame in px. Default 460. */
  videoMaxWidth?: number;
}) {
  const [openPost, setOpenPost] = useState<SocialPost | null>(null);

  return (
    <>
      <div className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-14 items-start">
        {posts.map((p, i) => (
          <PostCard
            key={p.src}
            post={p}
            index={i}
            videoMaxWidth={videoMaxWidth}
            platform={platform}
            onOpen={() => setOpenPost(p)}
          />
        ))}
      </div>

      <VideoLightbox
        post={openPost}
        platform={platform}
        onClose={() => setOpenPost(null)}
      />
    </>
  );
}

function PostCard({
  post,
  index,
  videoMaxWidth,
  platform,
  onOpen,
}: {
  post: SocialPost;
  index: number;
  videoMaxWidth: number;
  platform: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const play = () => {
    ref.current?.play().catch(() => {
      /* autoplay-after-interaction always works; swallow any race */
    });
  };
  const pause = () => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* ignore if not seekable yet */
    }
  };

  const tilt = TILTS[index % TILTS.length];
  const tape = TAPES[index % TAPES.length];
  const tapeRotate = index % 2 === 0 ? -6 : 7;
  const widthClamp = `min(${videoMaxWidth}px, 88vw)`;

  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "50% 30%" }}
    >
      {/* ── Video (hero) ─────────────────────────── */}
      <div className="relative w-full" style={{ maxWidth: widthClamp }}>
        {/* tape strip */}
        <span
          aria-hidden
          className="absolute -top-3 left-6 z-10 pointer-events-none"
          style={{
            width: 60,
            height: 14,
            background: tape,
            opacity: 0.85,
            transform: `rotate(${tapeRotate}deg)`,
            backgroundImage: `repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 9px), linear-gradient(${tape}, ${tape})`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        />

        <button
          type="button"
          onClick={onOpen}
          onMouseEnter={play}
          onMouseLeave={pause}
          onFocus={play}
          onBlur={pause}
          data-cursor-text="PLAY"
          aria-label={`播放《${post.postTitle}》`}
          className="group block w-full text-left relative overflow-hidden rounded-xl shadow-[0_12px_28px_-12px_rgba(0,0,0,0.24)] hover:shadow-[0_26px_44px_-14px_rgba(0,0,0,0.32)] transition-all duration-500 ease-out cursor-pointer"
        >
          <div
            className="relative bg-line overflow-hidden"
            style={{ aspectRatio: post.aspectRatio || "16 / 9" }}
          >
            <video
              ref={ref}
              src={post.src}
              poster={post.poster}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </button>
      </div>

      {/* ── Caption (de-emphasized) ──────────────── */}
      <div
        className="mt-5 w-full text-center px-2"
        style={{ maxWidth: widthClamp }}
      >
        <h3 className="serif text-[0.98rem] leading-snug text-foreground/85">
          {post.postTitle}
        </h3>

        <p className="text-muted text-[0.78rem] leading-relaxed mt-1.5">
          {post.body}
        </p>

        <Link
          href={post.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 text-[0.72rem] italic text-muted hover:text-foreground inline-flex items-center gap-1 underline underline-offset-[4px] decoration-[var(--red-pen)] decoration-1 transition"
        >
          在{platform}看完整版
          <Doodle
            kind="arrow-right"
            size={13}
            color="var(--red-pen)"
            strokeWidth={1.4}
          />
        </Link>
      </div>
    </div>
  );
}

/**
 * Fullscreen video lightbox. Plays the mp4 with native controls, unmuted by
 * default. Closes on: backdrop click, close button, Escape key. Locks body
 * scroll while open.
 */
function VideoLightbox({
  post,
  platform,
  onClose,
}: {
  post: SocialPost | null;
  platform: string;
  onClose: () => void;
}) {
  const open = post !== null;

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !post) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.postTitle}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 sm:px-8"
      style={{ background: "rgba(8, 8, 6, 0.88)", backdropFilter: "blur(6px)" }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-5 right-5 sm:top-7 sm:right-7 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Stop propagation so clicks on the player don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1200px] max-h-full flex flex-col gap-4"
      >
        <div
          className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: post.aspectRatio || "16 / 9" }}
        >
          <video
            // key forces React to mount a fresh video element each open
            key={post.src}
            src={post.src}
            poster={post.poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        </div>

        {/* Caption strip below the player */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 text-white/85">
          <h3 className="serif italic text-lg sm:text-xl">
            「{post.postTitle}」
          </h3>
          <Link
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm italic text-white/70 hover:text-white inline-flex items-center gap-1 underline underline-offset-[5px] decoration-[var(--red-pen)] decoration-1 transition"
          >
            在{platform}看完整版
            <Doodle
              kind="arrow-right"
              size={14}
              color="var(--red-pen)"
              strokeWidth={1.4}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
