import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fetchNotionWriting, fetchNotionWork, fetchNotionPhotos } from "./notion";

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

export async function getAllWorkFull(): Promise<WorkFull[]> {
  // First try to fetch from Notion
  console.log("getAllWorkFull: Trying Notion...");
  const notionWorks = await fetchNotionWork();
  if (notionWorks && notionWorks.length > 0) {
    console.log("getAllWorkFull: Using Notion data,", notionWorks.length, "works");
    return notionWorks;
  }
  console.log("getAllWorkFull: Falling back to local MDX");

  // Fallback to local MDX if Notion is not configured or empty
  return readCollection("work")
    .map(({ slug, data, content }) => ({
      slug,
      ...(data as Omit<WorkMeta, "slug">),
      content,
    }))
    .filter((w) => !w.draft)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
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
  // First try to fetch from Notion
  console.log("getAllWritingFull: Trying Notion...");
  const notionWritings = await fetchNotionWriting();
  if (notionWritings && notionWritings.length > 0) {
    console.log("getAllWritingFull: Using Notion data,", notionWritings.length, "posts");
    console.log("getAllWritingFull: Posts:", notionWritings.map(p => ({ title: p.title, slug: p.slug })));
    return notionWritings;
  }
  console.log("getAllWritingFull: Falling back to local MDX");

  // Fallback to local MDX if Notion is not configured or empty
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

const localPhotos: Photo[] = [
  {
    src: "/wall/me-2025.mp4",
    caption: "Me, 2025",
    rotate: -1.5,
    leftPct: 12,
    stringHeight: 32,
    width: 180,
    height: 285,
    zIndex: 4,
  },
  {
    src: "/wall/huijian.webp",
    caption: "回见",
    rotate: 1.2,
    leftPct: 82,
    stringHeight: 68,
    width: 220,
    height: 220,
    fit: "contain",
    imageScale: 1.2,
    zIndex: 1,
  },
  {
    src: "/wall/stickers.gif",
    caption: "表情包",
    rotate: -0.8,
    leftPct: 62,
    stringHeight: 48,
    width: 200,
    height: 200,
    fit: "contain",
    zIndex: 5,
  },
  {
    src: "/wall/photography.png",
    caption: "Photography",
    rotate: 0.6,
    leftPct: 40,
    stringHeight: 52,
    width: 160,
    height: 200,
    zIndex: 3,
  },
];

export async function getAllPhotos(): Promise<Photo[]> {
  // First try to fetch from Notion
  console.log("getAllPhotos: Trying Notion...");
  const notionPhotos = await fetchNotionPhotos();
  if (notionPhotos && notionPhotos.length > 0) {
    console.log("getAllPhotos: Using Notion data,", notionPhotos.length, "photos");
    return notionPhotos;
  }
  console.log("getAllPhotos: Falling back to local photos");

  return localPhotos;
}
