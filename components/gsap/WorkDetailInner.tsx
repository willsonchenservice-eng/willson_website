"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import MdxBody from "@/components/MdxBody";
import PaperClip from "@/components/notebook/PaperClip";
import gsap from "gsap";

interface ExtendedMeta {
  title: string;
  client?: string;
  role?: string;
  year?: string;
  summary?: string;
  cover?: string;
  externalLink?: string;
}

interface WorkDetailInnerProps {
  meta: ExtendedMeta;
  content: string;
}

export default function WorkDetailInner({ meta, content }: WorkDetailInnerProps) {
  const backRef = useRef<HTMLAnchorElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const coverRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    if (backRef.current) {
      tl.fromTo(
        backRef.current,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
      );
    }

    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.3"
      );
    }

    if (summaryRef.current) {
      tl.fromTo(
        summaryRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }

    if (coverRef.current) {
      tl.fromTo(
        coverRef.current,
        { opacity: 0, scale: 0.96, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "-=0.3"
      );
    }

    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.4"
      );
    }

    if (footerRef.current) {
      tl.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="notebook-shell py-10 sm:py-14">
      <div className="mx-auto" style={{ maxWidth: "1120px" }}>
        <Link
          ref={backRef}
          href="/work"
          className="text-sm text-muted hover:text-foreground transition inline-flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M9.56994 18.8201C9.37994 18.8201 9.18994 18.7501 9.03994 18.6001L2.96994 12.5301C2.67994 12.2401 2.67994 11.7601 2.96994 11.4701L9.03994 5.40012C9.32994 5.11012 9.80994 5.11012 10.0999 5.40012C10.3899 5.69012 10.3899 6.17012 10.0999 6.46012L4.55994 12.0001L10.0999 17.5401C10.3899 17.8301 10.3899 18.3101 10.0999 18.6001C9.95994 18.7501 9.75994 18.8201 9.56994 18.8201Z" />
            <path d="M20.4999 12.75H3.66992C3.25992 12.75 2.91992 12.41 2.91992 12C2.91992 11.59 3.25992 11.25 3.66992 11.25H20.4999C20.9099 11.25 21.2499 11.59 21.2499 12C21.2499 12.41 20.9099 12.75 20.4999 12.75Z" />
          </svg>
          <span>回到作品</span>
        </Link>

        <article className="mt-8">
          {/* Title block */}
          <header className="mb-10">
            <h1
              ref={titleRef}
              className="serif leading-[1.05] tracking-[-0.015em]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              {meta.title}
            </h1>

            {meta.summary && (
              <p
                ref={summaryRef}
                className="text-muted mt-5 text-lg sm:text-xl leading-relaxed"
              >
                {meta.summary}
              </p>
            )}

            {/* Metadata stamps */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {meta.externalLink && (
                <a
                  href={meta.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm serif underline underline-offset-[5px] decoration-[var(--red-pen)] hover:decoration-2 transition ml-2"
                >
                  外部链接 ↗
                </a>
              )}
            </div>
          </header>

          {/* Cover with paperclip */}
          {meta.cover && (
            <figure ref={coverRef as any} className="relative my-12">
              <PaperClip
                size={68}
                color="#444"
                rotate={-18}
                className="absolute -top-5 left-10 z-10"
              />
              <div
                className="relative aspect-[16/9] overflow-hidden bg-line"
                style={{ transform: "rotate(-0.6deg)" }}
              >
                <Image
                  src={meta.cover}
                  alt={meta.title}
                  fill
                  sizes="(min-width: 1280px) 900px, 100vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            </figure>
          )}

          {/* Body */}
          <div ref={contentRef}>
            <MdxBody source={content} className="prose-journal" />
          </div>

          {/* Footer of the work page */}
          <div
            ref={footerRef}
            className="mt-20 pt-6 border-t border-line flex items-baseline justify-between text-xs text-muted"
          >
            <Link
              href="/work"
              className="hover:text-foreground transition uppercase tracking-[0.22em]"
            >
              ← 翻回作品页
            </Link>
            <span className="serif tabular-nums tracking-wider">— fin · Ch · Ⅱ —</span>
          </div>
        </article>
      </div>
    </div>
  );
}
