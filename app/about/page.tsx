import ContactBlock from "@/components/ContactBlock";
import { site } from "@/lib/site";
import Chapter from "@/components/notebook/Chapter";
import InkUnderline from "@/components/notebook/InkUnderline";
import WashiTape from "@/components/notebook/WashiTape";
import Stamp from "@/components/notebook/Stamp";
import Doodle from "@/components/notebook/Doodle";
import StickyNote from "@/components/notebook/StickyNote";
import HandDivider from "@/components/notebook/HandDivider";

export const metadata = { title: "About" };

const influences = [
  { title: "王受之的设计史课", note: "把「互联网设计」装回设计史的脉络里" },
  { title: "Dieter Rams 设计十大原则", note: "永远的参照系" },
  { title: "《交互设计沉思录》", note: "竞品分析不能代替用户调研" },
  { title: "《影响力》", note: "为什么人会改变主意" },
  { title: "苹果的产品哲学", note: "设计驱动工程" },
];

export default function About() {
  return (
    <div className="notebook-shell py-10 sm:py-14">
      <Chapter
        title={
          <>
            我是谁
          </>
        }
        arrow={false}
      />

      {/* opening sentence — the spine of the about page */}
      <section className="mt-8 mb-10 grid lg:grid-cols-12 gap-x-10 gap-y-6 items-start">
        <div className="lg:col-span-8">
          <p
            className="serif leading-[1.15]"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            一个产品设计师、
            <InkUnderline thickness={2.6}>
              <span className="italic">独立开发者</span>
            </InkUnderline>
            
            <br />
            理想是持续做出给用户带来幸福、
            <InkUnderline thickness={2.6}>会心一笑</InkUnderline>
            的产品
            
          </p>

          <ul className="mt-7 space-y-3 text-lg">
            <li className="flex items-baseline gap-4">
              <Stamp
                size="xs"
                color="var(--foreground)"
                rotate={-4}
                className="shrink-0"
              >
                01
              </Stamp>
              <span>崇尚极简主义的设计风格。</span>
            </li>
            <li className="flex items-baseline gap-4">
              <Stamp
                size="xs"
                color="var(--foreground)"
                rotate={3}
                className="shrink-0"
              >
                02
              </Stamp>
              <span>追求更高的产品易用性。</span>
            </li>
          </ul>
        </div>

        {/* sticky note pinned in the margin */}
        <div className="lg:col-span-4 flex justify-start lg:justify-end">
          <StickyNote color="pink" rotate={3}>
            <div className="text-[11px] uppercase tracking-[0.22em] mb-2 text-foreground/55">
              status
            </div>
            <div
              className="leading-tight"
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "1.55rem",
                color: "var(--foreground)",
              }}
            >
              {site.location} ·{" "}
              <span style={{ color: "var(--red-pen)" }}>{site.timezone}</span>
              <br />
              想做的事还有很多
            </div>
          </StickyNote>
        </div>
      </section>

      <HandDivider className="my-8" />

      {/* Section: 过去几年在做的 */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <WashiTape color="yellow" width="200px" rotate={-1.5} label="过去几年在做的" />
        </div>
        <div className="prose-mdx">
          <p>
            {site.name}，在{site.location}。
            白天主要做大型 B 端工具产品——
            <InkUnderline thickness={1.6}>飞书安全</InkUnderline>、
            <InkUnderline thickness={1.6}>飞书开放平台</InkUnderline>、
            <InkUnderline thickness={1.6}>抖音审核平台</InkUnderline>。
            它们的共同点是：用户是企业里的某个岗位，
            需求来自真实业务摩擦，设计要在合规、效率、心智成本之间反复 trade-off。
          </p>
          <p>
            晚上和周末在做<strong>回见 App</strong>（独立开发的 iOS 应用）、
            <strong>表情包合集</strong>（合集下载 2,100+、累计发送 45,000+、单品最高
            240,000+），偶尔也<strong>拍照拍视频</strong>。
          </p>
          <p>
            我喜欢"看不见的复杂"——它逼着设计师走进业务，
            也允许在没有视觉炫技的地方做出真正的差别。
          </p>
        </div>
      </section>

      <HandDivider className="my-8" />

      {/* Section: 影响过我的 */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <WashiTape color="mint" width="180px" rotate={1.5} label="影响过我的" />
          <Doodle kind="asterisk" size={28} color="var(--red-pen)" strokeWidth={1.5} />
        </div>
        <ul className="space-y-2.5">
          {influences.map((it, i) => (
            <li key={it.title} className="flex items-baseline gap-4">
              <span
                className="text-[var(--red-pen)] tabular-nums font-mono text-sm shrink-0"
                style={{ width: "2.2rem" }}
              >
                {String(i + 1).padStart(2, "0")}.
              </span>
              <div className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="serif italic text-xl">{it.title}</span>
                <span className="text-sm text-muted">— {it.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <HandDivider className="my-8" />

      {/* Section: 除工作之外 */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <WashiTape color="pink" width="160px" rotate={-2} label="除此之外" />
        </div>
        <div className="prose-mdx">
          <p>
            维护一个公众号，写一些产品设计和方法论的笔记（都在
            <a href="/writing">Blog</a> 里）。
            偶尔做<strong>作品集 Review</strong> ——
            如果你也在准备简历或者跳槽，
            <a href="/services">这里</a>有详细的说明。
          </p>
        </div>
      </section>

      <ContactBlock />
    </div>
  );
}
