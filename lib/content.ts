import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fetchNotionWriting, fetchNotionWork, fetchNotionBeliefs, fetchNotionSocial } from "./notion";

export interface WorkFull extends WorkMeta {
  content: string;
}

/**
 * 从 Markdown 内容中提取纯文本摘要
 */
function extractSummary(markdown: string, maxLength: number = 100): string {
  // 1. 去掉 HTML/JSX 标签（比如 <Bilibili>）
  let text = markdown.replace(/<[^>]+>/g, "");

  // 2. 去掉图片语法 ![]()
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // 3. 去掉链接语法，只保留链接文字 [text](url) -> text
  text = text.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");

  // 4. 去掉 Markdown 格式字符（# * _ ~ ~）
  text = text.replace(/[#*_~`]/g, "");

  // 5. 去掉多余的空白字符
  text = text.replace(/\s+/g, " ").trim();

  // 6. 截取指定长度
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + "...";
  }

  return text;
}

export type Collection = "work" | "writing";

export interface WorkMeta {
  slug: string;
  title: string;
  client?: string;
  role?: string;
  year?: string;
  summary: string;
  cover?: string;
  coverFit?: "cover" | "contain";
  coverAspect?: string;
  tags?: string[];
  order?: number;
  draft?: boolean;
  externalLink?: string;
}

export interface WritingMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  topic?: string;
  source?: string;
  sourceUrl?: string;
  draft?: boolean;
}

export interface WritingFull extends WritingMeta {
  content: string;
}

const ROOT = path.join(process.cwd(), "content");

function debugLog(...args: unknown[]) {
  if (process.env.DEBUG_NOTION === "1") {
    console.info(...args);
  }
}

function readCollection(name: Collection) {
  const dir = path.join(ROOT, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      return { slug, data, content };
    });
}

function mergeBySlug<T extends { slug: string }>(localItems: T[], remoteItems: T[]) {
  const bySlug = new Map<string, T>();
  for (const item of localItems) bySlug.set(item.slug, item);
  for (const item of remoteItems) bySlug.set(item.slug, item);
  return [...bySlug.values()];
}

function readLocalWorkFull(): WorkFull[] {
  return readCollection("work")
    .map(({ slug, data, content }) => ({
      slug,
      ...(data as Omit<WorkMeta, "slug">),
      content,
    }))
    .filter((w) => !w.draft)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

function readLocalWritingFull(): WritingFull[] {
  return readCollection("writing")
    .map(({ slug, data, content }) => ({
      slug,
      ...(data as Omit<WritingMeta, "slug">),
      summary: data.summary || extractSummary(content),
      content,
    }))
    .filter((w) => !w.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllWorkFull(): Promise<WorkFull[]> {
  const localWorks = readLocalWorkFull();

  // First try to fetch from Notion
  debugLog("getAllWorkFull: Trying Notion...");
  const notionWorks = await fetchNotionWork();
  if (notionWorks && notionWorks.length > 0) {
    debugLog("getAllWorkFull: Merging Notion data,", notionWorks.length, "works");
    return mergeBySlug(localWorks, notionWorks)
      .filter((w) => !w.draft)
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
  debugLog("getAllWorkFull: Falling back to local MDX");

  return localWorks;
}

export async function getAllWork(): Promise<WorkMeta[]> {
  const allWorks = await getAllWorkFull();
  return allWorks.map(w => ({
    slug: w.slug,
    title: w.title,
    client: w.client,
    role: w.role,
    year: w.year,
    summary: w.summary,
    cover: w.cover,
    coverFit: w.coverFit,
    coverAspect: w.coverAspect,
    tags: w.tags,
    order: w.order,
    draft: w.draft,
    externalLink: w.externalLink,
  }));
}

export async function getWork(slug: string) {
  const allWorks = await getAllWorkFull();
  const work = allWorks.find(w => w.slug === slug);
  if (!work) return null;
  return { slug: work.slug, meta: work, content: work.content };
}

export async function getAllWriting(): Promise<WritingMeta[]> {
  const allWritings = await getAllWritingFull();
  return allWritings;
}

export async function getWriting(slug: string) {
  const allWritings = await getAllWritingFull();
  const writing = allWritings.find(w => w.slug === slug);
  if (!writing) return null;
  return { slug: writing.slug, meta: writing, content: writing.content };
}

export async function getAllWritingFull(): Promise<WritingFull[]> {
  const localWritings = readLocalWritingFull();

  // First try to fetch from Notion
  debugLog("getAllWritingFull: Trying Notion...");
  const notionWritings = await fetchNotionWriting();
  if (notionWritings && notionWritings.length > 0) {
    debugLog("getAllWritingFull: Merging Notion data,", notionWritings.length, "posts");
    debugLog("getAllWritingFull: Posts:", notionWritings.map((p: WritingFull) => ({ title: p.title, slug: p.slug })));
    return mergeBySlug(localWritings, notionWritings)
      .filter((w) => !w.draft)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  debugLog("getAllWritingFull: Falling back to local MDX");

  return localWritings;
}

export type Photo = {
  src: string;
  caption: string;
  href?: string;
  fit?: "cover" | "contain";
  imageScale?: number;
  rotate: number;
  leftPct: number;
  stringHeight: number;
  width: number;
  height: number;
  zIndex: number;
  hideOnMobile?: boolean;
};

const WALL_DIR = path.join(process.cwd(), "public", "wall");
const supportedWallAssetPattern = /\.(?:png|jpe?g|webp|gif|mp4|webm|mov)$/i;

const wallAssetMeta: Record<string, { caption: string; order: number }> = {
  "me-2025.mp4": { caption: "Me, 2025", order: 10 },
  "feishu_security.png": { caption: "飞书安全", order: 20 },
  "feishu_openplatform.png": { caption: "飞书开放平台", order: 30 },
  "beijiang.png": { caption: "北疆 Vlog", order: 40 },
  "stickers.gif": { caption: "表情包", order: 50 },
  "douyin-reviewer-care.png": { caption: "审核员关怀", order: 60 },
  "douyin-review.png": { caption: "抖音审核", order: 70 },
  "huijian.JPG": { caption: "回见", order: 80 },
};

const wallLayoutPresets: Array<Omit<Photo, "src" | "caption" | "href" | "fit" | "imageScale" | "hideOnMobile">> = [
  { rotate: -1.5, leftPct: 9, stringHeight: 32, width: 180, height: 285, zIndex: 5 },
  { rotate: 2.2, leftPct: 21, stringHeight: 70, width: 205, height: 168, zIndex: 2 },
  { rotate: -1.4, leftPct: 33, stringHeight: 48, width: 210, height: 170, zIndex: 4 },
  { rotate: 1.1, leftPct: 45, stringHeight: 82, width: 190, height: 150, zIndex: 1 },
  { rotate: -0.8, leftPct: 56, stringHeight: 48, width: 200, height: 200, zIndex: 7 },
  { rotate: 2.6, leftPct: 68, stringHeight: 92, width: 220, height: 168, zIndex: 3 },
  { rotate: -2.0, leftPct: 80, stringHeight: 60, width: 210, height: 164, zIndex: 6 },
  { rotate: 1.2, leftPct: 91, stringHeight: 76, width: 190, height: 250, zIndex: 4 },
];

function getWallFiles() {
  if (!fs.existsSync(WALL_DIR)) return [];
  return fs
    .readdirSync(WALL_DIR)
    .filter((file) => supportedWallAssetPattern.test(file))
    .sort((a, b) => {
      const orderA = wallAssetMeta[a]?.order ?? 999;
      const orderB = wallAssetMeta[b]?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b, "en");
    });
}

function fallbackWallCaption(file: string) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toWallPhoto(file: string, index: number, total: number): Photo {
  const preset = wallLayoutPresets[index % wallLayoutPresets.length];
  const leftPct =
    total <= wallLayoutPresets.length
      ? preset.leftPct
      : Math.round((8 + (84 * index) / Math.max(1, total - 1)) * 10) / 10;
  return {
    ...preset,
    leftPct,
    src: `/wall/${file}`,
    caption: wallAssetMeta[file]?.caption ?? fallbackWallCaption(file),
    fit: "contain",
  };
}

const localPhotos = getWallFiles().map((file, index, files) =>
  toWallPhoto(file, index, files.length)
);

export async function getAllPhotos(): Promise<Photo[]> {
  return localPhotos;
}

export type Belief = {
  n: string;
  lead: string;
  tail: string;
};

const localBeliefs: Belief[] = [
  { n: "01", lead: "崇尚 极简主义 的设计风格。", tail: "少即是多，不是炫技口号——是审视每个元素的去留。" },
  { n: "02", lead: "追求更高的 产品易用性。", tail: "好设计最终是看不见的——用户顺畅完成事，才是判准。" },
  { n: "03", lead: "微交互数 × 产品体验，成正比。", tail: "在满足任务的可用性之外，那些细小的反馈和动效，是体验差距的真正所在。" },
  { n: "04", lead: "顺水推舟，不与之争。", tail: "设计师推进体验优化要依赖产品和研发——顺应阶段，比硬碰硬有效得多。" },
];

export async function getAllBeliefs(): Promise<Belief[]> {
  debugLog("getAllBeliefs: Trying Notion...");
  const notionBeliefs = await fetchNotionBeliefs();
  if (notionBeliefs && notionBeliefs.length > 0) {
    debugLog("getAllBeliefs: Using Notion data,", notionBeliefs.length, "beliefs");
    return notionBeliefs;
  }
  debugLog("getAllBeliefs: Falling back to local");
  return localBeliefs;
}

export type SocialPost = {
  src: string;
  href: string;
  postTitle: string;
  body: string;
  aspectRatio: string;
};

const localSocial: SocialPost[] = [
  {
    src: "/xhs-xinjiang.mp4",
    href: "https://www.xiaohongshu.com/explore/6a0091b30000000036033144",
    postTitle: "五一逃去北疆，找回了自由的我",
    body: "五一我用相机记录自己从赛里木湖到那拉提的所见所想。",
    aspectRatio: "16 / 9",
  },
  {
    src: "/xhs-hangzhou.mp4",
    href: "https://www.xiaohongshu.com/discovery/item/68e3f714000000000300c431",
    postTitle: "你还在公式化旅游？听听我的故事 — 杭州街溜子",
    body: "厌倦打卡式旅游？这次我没有清单、没有路线，只是在杭州的街巷里漫无目的地溜达。",
    aspectRatio: "16 / 9",
  },
];

export async function getAllSocial(): Promise<SocialPost[]> {
  debugLog("getAllSocial: Trying Notion...");
  const notionSocial = await fetchNotionSocial();
  if (notionSocial && notionSocial.length > 0) {
    debugLog("getAllSocial: Using Notion data,", notionSocial.length, "posts");
    return notionSocial;
  }
  debugLog("getAllSocial: Falling back to local");
  return localSocial;
}
