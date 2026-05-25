import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllWork, getWork } from "@/lib/content";
import MdxBody from "@/components/MdxBody";
import Stamp from "@/components/notebook/Stamp";
import PaperClip from "@/components/notebook/PaperClip";

export function generateStaticParams() {
  const works = getAllWork();
  return works.map((w) => ({ slug: w.slug }));
}

export const dynamicParams = true;

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = params;
  const post = getWork(slug);
  if (!post) return {};
  return { title: post.meta.title, description: post.meta.summary };
}

interface ExtendedMeta {
  title: string;
  client?: string;
  role?: string;
  year?: string;
  summary?: string;
  cover?: string;
  externalLink?: string;
}

export default function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = params;
  const post = getWork(slug);
  if (!post) notFound();

  const meta = post.meta as unknown as ExtendedMeta;
  const content = post.content;

  return (
    <div className="notebook-shell py-10 sm:py-14">
      <div className="mx-auto" style={{ maxWidth: "1120px" }}>
        <Link
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
              className="serif leading-[1.05] tracking-[-0.015em]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              {meta.title}
            </h1>

            {meta.summary && (
              <p className="text-muted mt-5 text-lg sm:text-xl leading-relaxed">
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
            <figure className="relative my-12">
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
                  sizes="(min-width: 1280px) 1120px, 100vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            </figure>
          )}

          {/* Body */}
          <MdxBody source={content} className="prose-journal" />

          {/* Footer of the work page */}
          <div className="mt-20 pt-6 border-t border-line flex items-baseline justify-between text-xs text-muted">
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
