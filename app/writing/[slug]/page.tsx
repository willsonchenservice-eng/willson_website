import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWritingFull } from "@/lib/content";
import MdxBody from "@/components/MdxBody";
import Stamp from "@/components/notebook/Stamp";
import WashiTape from "@/components/notebook/WashiTape";
import PageNumber from "@/components/notebook/PageNumber";

export async function generateStaticParams() {
  const writings = await getAllWritingFull();
  return writings
    .filter((p) => !p.sourceUrl)
    .map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writings = await getAllWritingFull();
  const post = writings.find((w) => w.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

function parseDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return {
    y: d.getFullYear(),
    m: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export default async function WritingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await getAllWritingFull();

  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();

  // figure out where this entry sits in the chronological order to assign a page number
  const idx = all.findIndex((p) => p.slug === slug);
  const pageNo = idx >= 0 ? String(idx + 1).padStart(2, "0") : "—";

  const { content, ...meta } = post;
  const d = parseDate(meta.date);

  return (
    <div className="notebook-shell py-12">
      <Link
        href="/writing"
        className="text-sm text-muted hover:text-foreground transition inline-flex items-center gap-2"
      >
        ← 回到 Blog
      </Link>

      <article className="mt-10 grid lg:grid-cols-12 gap-x-12 gap-y-8">
        {/* left margin: date stamp + topic + page no */}
        <aside className="lg:col-span-3 flex flex-col items-start gap-4 lg:sticky lg:top-10 self-start">
          {d && (
            <Stamp size="md" color="var(--red-pen)" rotate={-4}>
              {d.y} · {d.m} · {d.day}
            </Stamp>
          )}
          {meta.topic && (
            <WashiTape
              color="yellow"
              width={`${Math.max(80, meta.topic.length * 14 + 28)}px`}
              rotate={-2}
              label={meta.topic}
            />
          )}
          <div className="mt-2">
            <PageNumber n={pageNo} />
          </div>
          {meta.source && (
            <p className="text-xs text-muted mt-2">原发于 {meta.source}</p>
          )}
        </aside>

        {/* right column: title + body */}
        <div className="lg:col-span-9 min-w-0">
          <h1
            className="serif  leading-[1.1] tracking-[-0.01em]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
          >
            {meta.title}
          </h1>
          {meta.summary && (
            <p className="text-muted mt-4 text-base leading-relaxed max-w-2xl">
              {meta.summary}
            </p>
          )}

          <div className="mt-10 prose-mdx max-w-none">
            <MdxBody source={content} />
          </div>

          <div className="mt-16 pt-6 border-t border-line flex items-baseline justify-between text-xs text-muted">
            <Link
              href="/writing"
              className="hover:text-foreground transition uppercase tracking-[0.22em]"
            >
              ← 翻回目录
            </Link>
            <span
              className="serif  tabular-nums"
            >
              — p. {pageNo} —
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
