import { getAllWritingFull } from "@/lib/content";
import JournalEntry from "@/components/JournalEntry";
import Chapter from "@/components/notebook/Chapter";

export const metadata = { title: "Blog" };

export default function WritingIndex() {
  const entries = getAllWritingFull();

  // group by year, newest first
  const byYear = entries.reduce<Record<string, typeof entries>>((acc, e) => {
    const y = new Date(e.date).getFullYear().toString();
    (acc[y] ||= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  // global index across all years, used for entry page numbers
  let globalIdx = 0;

  return (
    <div className="notebook-shell pb-24">
      <Chapter
        index="Ⅲ"
        kicker="Notebook"
        title={
          <>
            Blog
          </>
        }
        arrow={false}
        meta={
          <span className="block w-full">
            断断续续写的思考——包括我读到的书和文章、想到的思考、做项目遇到的问题
          </span>
        }
      />

      <div className="mt-6 space-y-10">
        {years.map((y) => (
          <section key={y}>
            {/* faded big year acting as a page divider */}
            <div
              className="select-none mb-1 leading-none"
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
                color: "color-mix(in srgb, var(--foreground) 12%, transparent)",
                transform: "rotate(-1.5deg)",
                letterSpacing: "-0.02em",
              }}
            >
              {y}
            </div>
            <div>
              {byYear[y].map((e) => {
                const node = (
                  <JournalEntry key={e.slug} entry={e} index={globalIdx} />
                );
                globalIdx += 1;
                return node;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
