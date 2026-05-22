import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { WritingFull } from "@/lib/content";
import Stamp from "@/components/notebook/Stamp";
import WashiTape from "@/components/notebook/WashiTape";
import PageNumber from "@/components/notebook/PageNumber";
import Bilibili from "@/components/mdx/Bilibili";
import AutoLink from "@/components/mdx/AutoLink";

const mdxComponents = {
  Bilibili,
  a: AutoLink,
};

function parseDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return {
    y: d.getFullYear(),
    m: String(d.getMonth() + 1).padStart(2, "0"),
    day: String(d.getDate()).padStart(2, "0"),
  };
}

export default function JournalEntry({
  entry,
  index = 0,
}: {
  entry: WritingFull;
  index?: number;
}) {
  const d = parseDate(entry.date);
  // alternate the date stamp tilt left/right per entry for a hand-stamped feel
  const stampRotate = index % 2 === 0 ? -4 : 3;

  return (
    <article className="relative grid sm:grid-cols-12 gap-x-10 gap-y-4 py-8 sm:py-10 border-b border-dashed border-line last:border-0">
      {/* left: date stamp + topic washi tape */}
      <header className="sm:col-span-3 sm:sticky sm:top-8 self-start flex flex-col items-start gap-3">
        {d && (
          <Stamp
            size="sm"
            color="var(--red-pen)"
            rotate={stampRotate}
            className="!font-mono"
          >
            {d.y} · {d.m} · {d.day}
          </Stamp>
        )}
        {entry.topic && (
          <WashiTape
            color={index % 3 === 0 ? "yellow" : index % 3 === 1 ? "mint" : "pink"}
            width={`${Math.max(72, entry.topic.length * 14 + 28)}px`}
            rotate={-2}
            label={entry.topic}
            className="mt-1"
          />
        )}
      </header>

      {/* right: title + body */}
      <div className="sm:col-span-9 relative">
        <h3
          className="serif text-2xl sm:text-[1.75rem] leading-snug mb-3"
          style={{ letterSpacing: "-0.01em" }}
        >
          <Link
            href={`/writing/${entry.slug}`}
            className="hover:opacity-70 transition"
          >
            {entry.title}
          </Link>
        </h3>
        <div className="prose-journal">
          <MDXRemote source={entry.content} components={mdxComponents} />
        </div>

      </div>
    </article>
  );
}
