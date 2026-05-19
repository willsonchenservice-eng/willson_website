import { getAllWork, type WorkMeta } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import Chapter from "@/components/notebook/Chapter";
import WashiTape from "@/components/notebook/WashiTape";

export const metadata = { title: "Work" };

const GROUP_ORDER = ["过往工作项目", "独立开发和其他作品"];
const GROUP_COLOR: Record<string, "yellow" | "mint" | "pink"> = {
  "过往工作项目": "yellow",
  "独立开发和其他作品": "mint",
};
const GROUP_HINT: Record<string, string> = {
  "B 端工作": "在公司里做过的产品",
  "独立项目": "下班和周末时间做的东西",
};

export default function WorkIndex() {
  const works = getAllWork();

  // group by tags[0]
  const groups: Record<string, WorkMeta[]> = {};
  for (const w of works) {
    const key = w.tags?.[0] ?? "其他";
    (groups[key] ||= []).push(w);
  }
  const keys = GROUP_ORDER.filter((k) => groups[k]).concat(
    Object.keys(groups).filter((k) => !GROUP_ORDER.includes(k))
  );

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
            到目前为止可以公开聊的项目。按类型分两组：
            白天在公司里做的 B 端产品；下班和周末做的 indie。
          </span>
        }
      />

      <div className="mt-8 space-y-12">
        {keys.map((key, gi) => (
          <section key={key}>
            <div className="mb-5 flex items-center gap-4 flex-wrap">
              <WashiTape
                color={GROUP_COLOR[key] ?? "yellow"}
                width={`${key.length * 18 + 80}px`}
                rotate={gi % 2 === 0 ? -1.5 : 1.5}
                label={key}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
              {groups[key].map((w, i) => (
                <WorkCard key={w.slug} work={w} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
