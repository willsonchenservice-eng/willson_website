import { getAllWork } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import Chapter from "@/components/notebook/Chapter";

export const metadata = { title: "Work" };

export default function WorkIndex() {
  const works = getAllWork();

  return (
    <div className="notebook-shell pb-24">
      <Chapter
        title={
          <>
            作品
          </>
        }
        titleFontFamily='Helvetica, "Courier New", Courier, monospace'
        arrow={false}
        meta={
          <span>
            到目前为止可以公开聊的项目。
          </span>
        }
      />

      <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-10">
        {works.map((w, i) => (
          <WorkCard key={w.slug} work={w} index={i} />
        ))}
      </div>
    </div>
  );
}
