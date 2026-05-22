import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";
import https from "https";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 内存缓存，避免重复请求 Notion
// 用 globalThis 避免热更新时缓存丢失
const getCache = () => {
  if (!(globalThis as any).__notionCache) {
    (globalThis as any).__notionCache = {
      writings: null,
      works: null,
      time: 0
    };
  }
  return (globalThis as any).__notionCache;
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟;

// 确保图片目录存在
function ensureImagesDir() {
  const imagesDir = path.join(process.cwd(), "public", "notion-images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  return imagesDir;
}

// 下载图片到本地
async function downloadImage(url: string, fileId: string): Promise<string> {
  const imagesDir = ensureImagesDir();

  // 检查是否已经有这个 fileId 的图片（不关心后缀）
  const existingFiles = fs.readdirSync(imagesDir);
  const existingFile = existingFiles.find(f => f.startsWith(fileId));
  if (existingFile) {
    return `/notion-images/${existingFile}`;
  }

  const filename = `${fileId}.png`;
  const localPath = path.join(imagesDir, filename);

  console.log(`Downloading image: ${filename}`);

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(localPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve(`/notion-images/${filename}`);
      });

      fileStream.on("error", (err) => {
        fs.unlink(localPath, () => {}); // 删除可能的不完整文件
        reject(err);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * 处理 Notion 图片：下载到本地并替换链接
 */
async function processNotionImages(markdown: string): Promise<string> {
  // 匹配 ![]() 格式的图片
  const imgRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g;
  let match;
  const replacements: Array<{ original: string; localUrl: string }> = [];

  while ((match = imgRegex.exec(markdown)) !== null) {
    const original = match[0];
    const url = match[2];

    // 只处理 Notion 的 S3 图片链接
    if (url.includes("prod-files-secure.s3.us-west-2.amazonaws.com")) {
      try {
        // 生成文件名：从 URL 中提取 UUID
        const urlPath = new URL(url).pathname;
        const parts = urlPath.split("/");
        const fileId = parts[parts.length - 2]; // 取倒数第二段作为 ID

        const localUrl = await downloadImage(url, fileId);
        replacements.push({ original, localUrl });
      } catch (e) {
        console.warn("Failed to process image:", e);
      }
    }
  }

  // 替换链接
  let result = markdown;
  for (const { original, localUrl } of replacements) {
    const altMatch = original.match(/!\[([^\]]*)\]/);
    const alt = altMatch ? altMatch[1] : "";
    result = result.replace(original, `![${alt}](${localUrl})`);
  }

  return result;
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

/**
 * 把 Markdown 中的 B 站链接转换成 <Bilibili> 组件
 */
function convertBilibiliLinks(markdown: string): string {
  // 匹配 [text](url) 格式的 B 站链接
  return markdown.replace(
    /\[([^\]]*)\]\((https?:\/\/[^\)]*bilibili\.[^\)]+|https?:\/\/[^\)]*b23\.tv[^\)]*)\)/g,
    (match, text, url) => {
      try {
        const u = new URL(url);
        let bvid = "";

        // 处理 b23.tv 短链接 (这里只能做简单处理，因为不做实际网络请求)
        if (u.hostname.includes("b23.tv")) {
          // 暂时保持原样，因为需要重定向解析
          return match;
        }

        // 处理普通视频链接: /video/BVxxxxx
        const matchBV = u.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/);
        if (matchBV) {
          bvid = matchBV[1];
          return `\n\n<Bilibili bvid="${bvid}" />\n\n`;
        }

        // 处理 Cheese (课程) 链接: /cheese/play/epxxxxx
        const matchEp = u.pathname.match(/\/cheese\/play\/(ep[0-9]+)/);
        if (matchEp) {
          // 对于 ep 链接，我们也用 bvid 参数传递，然后在组件里处理
          bvid = matchEp[1];
          return `\n\n<Bilibili bvid="${bvid}" />\n\n`;
        }
      } catch (e) {
        // 无效 URL，保持原样
      }

      return match;
    }
  );
}

export async function fetchNotionWriting() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion environment variables. Falling back to local MDX.");
    console.warn("NOTION_DATABASE_ID:", databaseId ? "set" : "missing");
    console.warn("NOTION_API_KEY:", process.env.NOTION_API_KEY ? "set" : "missing");
    return null;
  }

  // 检查缓存
  const now = Date.now();
  const cache = getCache();
  if (cache.writings && (now - cache.time < CACHE_DURATION)) {
    console.log("Notion: Using cached data");
    return cache.writings;
  }

  console.log("Notion: Fetching from database...");

  try {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      filter: {
        property: "Status",
        status: {
          equals: "完成",
        },
      },
      sorts: [
        {
          property: "date",
          direction: "descending",
        },
      ],
    });

    const writings = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page) => {
          const props = page.properties;

          // Extract properties (Chinese field names)
          const titleProp = props["名称"];
          const slugProp = props["Slug"];
          const dateProp = props["date"];
          const topicProp = props["Topic"];

          const title = titleProp?.title?.[0]?.plain_text || "Untitled";
          // 优先用用户填的 Slug，如果没有就用 Notion page ID
          let slug = slugProp?.rich_text?.[0]?.plain_text || page.id;
          // Clean slug: replace spaces with -, remove special chars
          slug = slug.replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '');
          const date = dateProp?.date?.start || new Date().toISOString();

          // Topic is multi-select, take first one
          let topic: string | undefined;
          if (topicProp?.multi_select && topicProp.multi_select.length > 0) {
            topic = topicProp.multi_select[0].name;
          }

          // Fetch page content as markdown directly
          const mdResponse = await notion.pages.retrieveMarkdown({
            page_id: page.id,
          });

          let content = mdResponse.markdown || "";

          // 修复 Notion 返回的 HTML 标签，让 MDX 能正确解析
          content = content.replace(/<br>/g, "<br/>");
          content = content.replace(/<hr>/g, "<hr/>");
          content = content.replace(/<img([^>]*)>/g, "<img$1/>");

          // 处理图片：下载到本地并替换链接
          content = await processNotionImages(content);

          // 转换 B 站链接成 <Bilibili> 组件
          content = convertBilibiliLinks(content);

          // 从正文内容提取摘要
          const summary = extractSummary(content);

          return {
            slug,
            title,
            date,
            summary,
            topic,
            source: undefined,
            sourceUrl: undefined,
            content,
          };
        })
    );

    // 保存缓存
    const cache = getCache();
    cache.writings = writings;
    cache.time = now;

    return writings;
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    return null;
  }
}

export async function fetchNotionWork() {
  const databaseId = process.env.NOTION_WORK_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion Work database env vars. Falling back to local MDX.");
    return null;
  }

  // 检查缓存
  const now = Date.now();
  const cache = getCache();
  if (cache.works && (now - cache.time < CACHE_DURATION)) {
    console.log("Notion: Using cached work data");
    return cache.works;
  }

  console.log("Notion: Fetching work from database...");

  try {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      filter: {
        property: "Status",
        status: {
          equals: "完成",
        },
      },
      sorts: [
        {
          property: "order",
          direction: "ascending",
        },
      ],
    });

    const works = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page, index) => {
          const props = page.properties;

          // Extract properties (Chinese field names)
          const titleProp = props["名称"];
          const slugProp = props["Slug"];
          const coverProp = props["cover"];

          const title = titleProp?.title?.[0]?.plain_text || "Untitled";
          let slug = slugProp?.rich_text?.[0]?.plain_text || page.id;
          slug = slug.replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '');

          // 处理 cover：如果是 Notion 图片，下载到本地
          let cover: string | undefined;
          if (coverProp?.files?.[0]) {
            const file = coverProp.files[0];
            if (file.type === "file" && file.file?.url) {
              try {
                const urlPath = new URL(file.file.url).pathname;
                const parts = urlPath.split("/");
                const fileId = parts[parts.length - 2];
                cover = await downloadImage(file.file.url, fileId);
              } catch (e) {
                console.warn("Failed to download cover:", e);
              }
            } else if (file.type === "external" && file.external?.url) {
              cover = file.external.url;
            }
          }

          // Fetch page content as markdown directly
          const mdResponse = await notion.pages.retrieveMarkdown({
            page_id: page.id,
          });

          let content = mdResponse.markdown || "";

          // 修复 Notion 返回的 HTML 标签
          content = content.replace(/<br>/g, "<br/>");
          content = content.replace(/<hr>/g, "<hr/>");
          content = content.replace(/<img([^>]*)>/g, "<img$1/>");

          // 处理图片：下载到本地并替换链接
          content = await processNotionImages(content);

          return {
            slug,
            title,
            cover,
            // 从内容提取摘要
            summary: extractSummary(content),
            content,
          };
        })
    );

    // 保存缓存
    cache.works = works;
    cache.time = now;

    return works;
  } catch (error) {
    console.error("Error fetching work from Notion:", error);
    return null;
  }
}
