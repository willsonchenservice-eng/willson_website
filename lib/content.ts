import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

export function getAllWork(): WorkMeta[] {
  return readCollection("work")
    .map(({ slug, data }) => ({ slug, ...(data as Omit<WorkMeta, "slug">) }))
    .filter((w) => !w.draft)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getWork(slug: string) {
  const dir = path.join(ROOT, "work", `${slug}.mdx`);
  if (!fs.existsSync(dir)) return null;
  const { data, content } = matter(fs.readFileSync(dir, "utf8"));
  return { slug, meta: data as WorkMeta, content };
}

export function getAllWriting(): WritingMeta[] {
  return readCollection("writing")
    .map(({ slug, data }) => ({ slug, ...(data as Omit<WritingMeta, "slug">) }))
    .filter((w) => !w.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWriting(slug: string) {
  const dir = path.join(ROOT, "writing", `${slug}.mdx`);
  if (!fs.existsSync(dir)) return null;
  const { data, content } = matter(fs.readFileSync(dir, "utf8"));
  return { slug, meta: data as WritingMeta, content };
}
