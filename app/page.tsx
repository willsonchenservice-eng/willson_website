import Link from "next/link";
import { getAllWork, getAllWriting } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import ArticleCard from "@/components/ArticleCard";
import Hero from "@/components/Hero";
import Chapter from "@/components/notebook/Chapter";
import HandDivider from "@/components/notebook/HandDivider";
import Stamp from "@/components/notebook/Stamp";
import InkUnderline from "@/components/notebook/InkUnderline";
import Doodle from "@/components/notebook/Doodle";
import SocialEmbed from "@/components/SocialEmbed";

const BELIEFS = [
  {
    n: "01",
    lead: (
      <>
        崇尚 <InkUnderline>极简主义</InkUnderline> 的设计风格。
      </>
    ),
    tail: "少即是多，不是炫技口号——是审视每个元素的去留。",
  },
  {
    n: "02",
    lead: (
      <>
        追求更高的 <InkUnderline>产品易用性</InkUnderline>。
      </>
    ),
    tail: "好设计最终是看不见的——用户顺畅完成事，才是判准。",
  },
  {
    n: "03",
    lead: (
      <>
        <InkUnderline>微交互数</InkUnderline> × 产品体验，成正比。
      </>
    ),
    tail: "在满足任务的可用性之外，那些细小的反馈和动效，是体验差距的真正所在。",
  },
  {
    n: "04",
    lead: <>顺水推舟，不与之争。</>,
    tail: "设计师推进体验优化要依赖产品和研发——顺应阶段，比硬碰硬有效得多。",
  },
];

export default function Home() {
  const works = getAllWork().slice(0, 4);
  const posts = getAllWriting().slice(0, 5);

  return (
    <>
      <Hero />

      <div className="notebook-shell">
        {/* ── Selected Work ───────────────────────────── */}
          <section className="my-[200px]">
            <HandDivider className="my-8" />
            <Chapter
              title={
                <>
                  我的项目
                </>
              }
              titleFontFamily='"Courier New", Courier, monospace'
              arrow={false}
              meta={
                <span>
                  我最近在工作之中和工作之余做的一些项目
                  <Link
                    href="/work"
                    className="ml-1 underline underline-offset-[5px] decoration-[var(--red-pen)] decoration-1 hover:decoration-2 transition"
                  >
                    看全部
                  </Link>
                  。
                </span>
              }
            />
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {works.map((w, i) => (
                <WorkCard key={w.slug} work={w} index={i} />
              ))}
            </div>
          </section>

        {/* ── Manifesto ───────────────────────────── */}
          <section className="my-[200px]">
            <HandDivider className="my-8" />
            <Chapter
              title={
                <>
                  设计理念
                </>
              }
              titleFontFamily='"Lucida Console", Monaco, monospace'
              arrow={false}
            />
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {BELIEFS.map((b, i) => (
                <li
                  key={b.n}
                  className="flex items-start gap-4 border-b border-dashed border-line pb-5"
                >
                  <Stamp
                    size="sm"
                    color="var(--red-pen)"
                    rotate={i % 2 === 0 ? -4 : 3}
                    className="shrink-0 mt-1"
                  >
                    {b.n}
                  </Stamp>
                  <div className="flex-1 min-w-0">
                    <p className="serif text-xl sm:text-[1.4rem] leading-snug">
                      {b.lead}
                    </p>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      {b.tail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        {/* ── Latest from the Notebook ───────────────────────────── */}
          <section className="my-[200px]">
            <HandDivider className="my-8" />
            <Chapter
              title={<>Blog</>}
              titleFontFamily='"Comic Sans MS", cursive'
              titleLineHeight="100px"
              arrow={false}
              meta={
                <span>
                  读到的、想到的、做项目时被刺到的。
                  <Link
                    href="/writing"
                    className="ml-1 underline underline-offset-[5px] decoration-[var(--red-pen)] decoration-1 hover:decoration-2 transition"
                  >
                    看全部 Blog
                  </Link>
                  。
                </span>
              }
            />
            <div className="mt-6">
              {posts.map((p, i) => (
                <ArticleCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </section>

        {/* ── On Xiaohongshu ───────────────────────────── */}
          <section className="mt-[100px]">
            <HandDivider className="my-8" />
            <Chapter
              title={<>自媒体</>}
              titleFontFamily='"Courier New", Courier, monospace'
              arrow={false}
              meta={
                <span>
                  通过视频记录自己的见闻、所思、所想
                </span>
              }
            />
            <SocialEmbed
              platform="小红书"
              videoMaxWidth={400}
              posts={[
                {
                  src: "/wall/xhs-xinjiang.mp4",
                  href: "https://www.xiaohongshu.com/explore/6a0091b30000000036033144?xsec_token=YBJkVmHPRc2NZ1SwqKizTqb31Jk6fgE9uVtMhfGZIBjiw%3D&xsec_source=pc_creatormng",
                  postTitle: "五一逃去北疆，找回了自由的我",
                  body: "五一我用相机记录了自己从赛里木湖到那拉提的所见所想。我的新疆领队看过之后非常喜欢，重新让他感受到了对新疆的热爱。",
                  aspectRatio: "16 / 9",
                },
                {
                  src: "/wall/xhs-hangzhou.mp4",
                  href: "https://www.xiaohongshu.com/discovery/item/68e3f714000000000300c431?source=webshare&xhsshare=pc_web&xsec_token=ABFXKMn3LyrhPkarwZnDVPeilXAADT19Lv9R6TLZ_vhHQ=&xsec_source=pc_share",
                  postTitle: "你还在公式化旅游？听听我的故事 — 杭州街溜子",
                  body: "厌倦了打卡式的旅游？这次我没有清单、没有路线，只是在杭州的街巷里漫无目的地溜达。真正的城市气味，往往藏在没人拍的那些角落里。",
                  aspectRatio: "16 / 9",
                },
              ]}
            />
          </section>

        {/* ── Services teaser ───────────────────────────── */}
          <section className="mt-[100px] mb-4">
            <HandDivider className="my-8" />
            <Chapter
              title={
                <>
                  想合作？
                </>
              }
              titleFontFamily='"Courier New", Courier, monospace'
              arrow={false}
            />
            <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
              <p className="serif text-xl sm:text-2xl leading-snug max-w-xl">
                项目合作或作品集指导，欢迎私聊
              </p>
              <Link
                href="/services"
                className="serif  text-lg inline-flex items-center gap-2 self-start underline underline-offset-[5px] decoration-[var(--red-pen)] decoration-1 hover:decoration-2 transition"
              >
                看委托单
                <Doodle
                  kind="arrow-right"
                  size={24}
                  color="var(--red-pen)"
                  strokeWidth={1.6}
                />
              </Link>
            </div>
          </section>
      </div>
    </>
  );
}
