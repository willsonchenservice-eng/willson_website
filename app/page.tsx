import Link from "next/link";
import { getAllWork, getAllWriting, getAllBeliefs, getAllSocial } from "@/lib/content";
import WorkCard from "@/components/WorkCard";
import ArticleCard from "@/components/ArticleCard";
import Hero from "@/components/Hero";
import Chapter from "@/components/notebook/Chapter";
import HandDivider from "@/components/notebook/HandDivider";
import Stamp from "@/components/notebook/Stamp";
import InkUnderline from "@/components/notebook/InkUnderline";
import Doodle from "@/components/notebook/Doodle";
import SocialEmbed from "@/components/SocialEmbed";

function BeliefLead({ lead }: { lead: string }) {
  const match = lead.match(/(.*?)(极简主义|产品易用性|微交互数)(.*)/);
  if (match) {
    return (
      <>
        {match[1]}<InkUnderline>{match[2]}</InkUnderline>{match[3]}
      </>
    );
  }
  return <>{lead}</>;
}

export default async function Home() {
  const works = (await getAllWork()).slice(0, 4);
  const posts = (await getAllWriting()).slice(0, 5);
  const beliefs = await getAllBeliefs();
  const social = await getAllSocial();

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
                  作品
                </>
              }
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
              arrow={false}
            />
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {beliefs.map((b, i) => (
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
                      <BeliefLead lead={b.lead} />
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
              posts={social}
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
