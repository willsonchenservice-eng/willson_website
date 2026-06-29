import { Client, LogLevel } from "@notionhq/client";
import fs from "fs";
import path from "path";
import https from "https";

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

const NOTION_TIMEOUT_MS = envNumber("NOTION_TIMEOUT_MS", 3000);
const NOTION_MAX_RETRIES = envNumber("NOTION_MAX_RETRIES", 0);
const NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS = envNumber("NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS", 3000);

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  logLevel: LogLevel.ERROR,
  timeoutMs: NOTION_TIMEOUT_MS,
  retry: NOTION_MAX_RETRIES === 0 ? false : { maxRetries: NOTION_MAX_RETRIES },
});

function debugLog(...args: unknown[]) {
  if (process.env.DEBUG_NOTION === "1") {
    console.info(...args);
  }
}

// 内存缓存，避免重复请求 Notion
// 用 globalThis 避免热更新时缓存丢失
const getCache = () => {
  if (!(globalThis as any).__notionCache) {
    (globalThis as any).__notionCache = {
      writings: null,
      works: null,
      photos: null,
      beliefs: null,
      social: null,
      dataSources: {},
      cacheTimes: {
        writings: 0,
        works: 0,
        photos: 0,
        beliefs: 0,
        social: 0,
      },
    };
  }
  return (globalThis as any).__notionCache;
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟;

function isCacheFresh(cache: any, key: "writings" | "works" | "photos" | "beliefs" | "social", now: number) {
  return cache[key] && now - cache.cacheTimes[key] < CACHE_DURATION;
}

function formatNotionError(error: unknown) {
  if (error && typeof error === "object") {
    const err = error as { code?: string; message?: string };
    const code = err.code ? `${err.code}: ` : "";
    return `${code}${err.message || "Unknown Notion error"}`;
  }
  return String(error);
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function extensionFromFilename(filename?: string) {
  const ext = filename?.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)?.[1];
  return ext ? ext.toLowerCase() : "png";
}

function notionFileCacheId(pageId: string, index: number, filename?: string) {
  const base = filename?.replace(/\.[a-z0-9]{2,5}$/i, "") || `img-${index}`;
  return `${slugPart(pageId)}-${index}-${slugPart(base) || "file"}`;
}

type ResolvedDataSource = {
  id: string;
  properties: Record<string, any>;
};

function findSchemaPropertyName(properties: Record<string, any>, names: string[]) {
  for (const name of names) {
    if (properties[name]) return name;
  }
  return undefined;
}

function buildStatusFilter(properties: Record<string, any>) {
  const property = findSchemaPropertyName(properties, ["Status", "status", "状态"]);
  if (!property) return undefined;

  const type = properties[property]?.type;
  if (type === "status") {
    return { property, status: { equals: "完成" } };
  }
  if (type === "select") {
    return { property, select: { equals: "完成" } };
  }
  return undefined;
}

function buildOrderSort(properties: Record<string, any>) {
  const property = findSchemaPropertyName(properties, ["Order", "order", "排序"]);
  if (!property) return undefined;

  return [{ property, direction: "ascending" as const }];
}

function buildDateSort(properties: Record<string, any>) {
  const property = findSchemaPropertyName(properties, ["date", "Date", "日期"]);
  if (!property) return undefined;

  return [{ property, direction: "descending" as const }];
}

async function resolveDataSource(id: string, force: boolean = false): Promise<ResolvedDataSource> {
  const cache = getCache();
  if (!force && cache.dataSources?.[id]) {
    return cache.dataSources[id];
  }

  try {
    const database = await notion.databases.retrieve({ database_id: id });
    const dataSourceId = (database as any).data_sources?.[0]?.id;
    if (dataSourceId) {
      const dataSource = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
      const resolved = {
        id: dataSourceId,
        properties: "properties" in dataSource ? dataSource.properties : {},
      };
      cache.dataSources[id] = resolved;
      return resolved;
    }
  } catch {}

  const dataSource = await notion.dataSources.retrieve({ data_source_id: id });
  const resolved = {
    id,
    properties: "properties" in dataSource ? dataSource.properties : {},
  };
  cache.dataSources[id] = resolved;
  return resolved;
}

// 确保图片目录存在
function ensureImagesDir() {
  const imagesDir = path.join(process.cwd(), "public", "notion-images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  return imagesDir;
}

// 下载图片到本地
async function downloadImage(
  url: string,
  fileId: string,
  force: boolean = false,
  filenameHint?: string
): Promise<string> {
  const imagesDir = ensureImagesDir();

  // 检查是否已经有这个 fileId 的图片（不关心后缀）
  const existingFiles = fs.readdirSync(imagesDir);
  const existingFile = existingFiles.find(f => f.startsWith(fileId));
  if (existingFile && !force) {
    debugLog(`Using cached image: ${existingFile} for fileId: ${fileId}`);
    return `/notion-images/${existingFile}`;
  }

  // 如果强制刷新，删除旧文件
  if (existingFile && force) {
    debugLog(`Deleting old image: ${existingFile}`);
    fs.unlinkSync(path.join(imagesDir, existingFile));
  }

  const filename = `${fileId}.${extensionFromFilename(filenameHint)}`;
  const localPath = path.join(imagesDir, filename);

  debugLog(`Downloading image: ${filename} from ${url.substring(0, 80)}...`);

  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(localPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        debugLog(`Downloaded: ${filename}`);
        resolve(`/notion-images/${filename}`);
      });

      fileStream.on("error", (err) => {
        fs.unlink(localPath, () => {}); // 删除可能的不完整文件
        reject(err);
      });
    });

    request.setTimeout(NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS, () => {
      request.destroy(new Error(`Image download timed out after ${NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS}ms`));
    });

    request.on("error", (err) => {
      fs.unlink(localPath, () => {});
      reject(err);
    });
  });
}

/**
 * 处理 Notion 图片：下载到本地并替换链接
 */
async function processNotionImages(markdown: string, pageId: string, force: boolean = false): Promise<string> {
  // 匹配 ![]() 格式的图片
  const imgRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g;
  let match;
  let index = 0;
  const replacements: Array<{ original: string; localUrl: string }> = [];

  while ((match = imgRegex.exec(markdown)) !== null) {
    const original = match[0];
    const url = match[2];

    // 只处理 Notion 的 S3 图片链接
    if (url.includes("prod-files-secure.s3.us-west-2.amazonaws.com")) {
      try {
        const filename = decodeURIComponent(new URL(url).pathname.split("/").pop() || `img-${index}.png`);
        const localUrl = await downloadImage(
          url,
          notionFileCacheId(pageId, index, filename),
          force,
          filename
        );
        replacements.push({ original, localUrl });
        index += 1;
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
  text = text.replace(/!\[[^\]]*]\([^)]+\)/g, "");

  // 3. 去掉链接语法，只保留链接文字 [text](url) -> text
  text = text.replace(/\[([^\]]*)]\([^)]+\)/g, "$1");

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
    /\[([^\]]*)]\((https?:\/\/[^\)]*bilibili\.[^\)]+|https?:\/\/[^\)]*b23\.tv[^\)]*)\)/g,
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

export async function fetchNotionWriting(force: boolean = false) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion environment variables. Falling back to local MDX.");
    return null;
  }

  const now = Date.now();
  const cache = getCache();
  if (!force && isCacheFresh(cache, "writings", now)) {
    return cache.writings;
  }

  debugLog("Notion: Fetching from database...");

  try {
    const dataSource = await resolveDataSource(databaseId, force);
    const filter = buildStatusFilter(dataSource.properties);
    const sorts = buildDateSort(dataSource.properties);
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
    });

    const writings = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page) => {
          const props = page.properties;

          const titleProp = getProp(props, ["名称", "Name", "Title"]);
          const slugProp = getProp(props, ["Slug"]);
          const dateProp = getProp(props, ["date", "Date", "日期"]);
          const topicProp = getProp(props, ["Topic", "话题"]);
          const summaryProp = getProp(props, ["Summary", "摘要"]);

          const title = titleProp?.title?.[0]?.plain_text || "Untitled";
          let slug = slugProp?.rich_text?.[0]?.plain_text || page.id;
          slug = slug.replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '');
          const date = dateProp?.date?.start || new Date().toISOString();

          let topic: string | undefined;
          if (topicProp?.multi_select?.[0]) topic = topicProp.multi_select[0].name;

          const mdResponse = await notion.pages.retrieveMarkdown({ page_id: page.id });
          let content = mdResponse.markdown || "";
          content = content.replace(/<br>/g, "<br/>");
          content = content.replace(/<hr>/g, "<hr/>");
          content = content.replace(/<img([^>]*)>/g, "<img$1/>");
          content = await processNotionImages(content, page.id, force);
          content = convertBilibiliLinks(content);

          const summaryFromProp = summaryProp?.rich_text?.[0]?.plain_text;
          const summary = summaryFromProp || extractSummary(content);

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

    cache.writings = writings;
    cache.cacheTimes.writings = now;

    return writings;
  } catch (error) {
    console.warn(`Notion writing unavailable. Falling back to local MDX. ${formatNotionError(error)}`);
    return null;
  }
}

function getProp(props: Record<string, any>, names: string[]) {
  for (const name of names) {
    if (props[name]) return props[name];
  }
  return undefined;
}

export async function fetchNotionBeliefs(force: boolean = false) {
  const databaseId = process.env.NOTION_BELIEFS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion Beliefs database env vars. Falling back to local.");
    return null;
  }

  const now = Date.now();
  const cache = getCache();
  if (!force && isCacheFresh(cache, "beliefs", now)) {
    return cache.beliefs;
  }

  debugLog("Notion: Fetching beliefs from database...");

  try {
    const dataSource = await resolveDataSource(databaseId, force);
    const filter = buildStatusFilter(dataSource.properties);
    const sorts = buildOrderSort(dataSource.properties);
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
    });

    const beliefs = response.results
      .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
        item.object === "page"
      )
      .map((page, index) => {
        const props = page.properties;

        const titleProp = getProp(props, ["名称", "Name", "Title", "Lead", "标题"]);
        const tailProp = getProp(props, ["Tail", "Description", "描述"]);
        const orderProp = getProp(props, ["Order", "排序"]);

        const lead = titleProp?.title?.[0]?.plain_text || "";
        const tail = tailProp?.rich_text?.[0]?.plain_text || "";

        return {
          n: String(orderProp?.number ?? index + 1).padStart(2, "0"),
          lead,
          tail,
        };
      });

    cache.beliefs = beliefs;
    cache.cacheTimes.beliefs = now;
    return beliefs;
  } catch (error) {
    console.warn(`Notion beliefs unavailable. Falling back to local. ${formatNotionError(error)}`);
    return null;
  }
}

export async function fetchNotionSocial(force: boolean = false) {
  const databaseId = process.env.NOTION_SOCIAL_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion Social database env vars. Falling back to local.");
    return null;
  }

  const now = Date.now();
  const cache = getCache();
  if (!force && isCacheFresh(cache, "social", now)) {
    return cache.social;
  }

  debugLog("Notion: Fetching social from database...");

  try {
    const dataSource = await resolveDataSource(databaseId, force);
    const filter = buildStatusFilter(dataSource.properties);
    const sorts = buildOrderSort(dataSource.properties);
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
    });

    const social = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page) => {
          const props = page.properties;

          const titleProp = getProp(props, ["名称", "Name", "Title", "标题"]);
          const fileProp = getProp(props, ["File", "Video", "视频"]);
          const externalUrlProp = getProp(props, ["ExternalUrl", "外部链接"]);
          const linkProp = getProp(props, ["Link", "链接"]);
          const bodyProp = getProp(props, ["Body", "Description", "描述"]);
          const aspectProp = getProp(props, ["Aspect", "比例"]);

          const postTitle = titleProp?.title?.[0]?.plain_text || "";
          const body = bodyProp?.rich_text?.[0]?.plain_text || "";
          const href = linkProp?.url || "";
          const aspectRatio = aspectProp?.rich_text?.[0]?.plain_text || "16 / 9";

          let src: string | undefined;
          if (fileProp?.files?.[0]) {
            const file = fileProp.files[0];
            if (file.type === "file" && file.file?.url) {
              try {
                src = await downloadImage(
                  file.file.url,
                  notionFileCacheId(page.id, 0, file.name),
                  force,
                  file.name
                );
              } catch (e) {}
            } else if (file.type === "external" && file.external?.url) {
              src = file.external.url;
            }
          }
          if (!src && externalUrlProp?.url) {
            src = externalUrlProp.url;
          }

          return {
            src: src || "",
            href,
            postTitle,
            body,
            aspectRatio,
          };
        })
    );

    cache.social = social;
    cache.cacheTimes.social = now;
    return social;
  } catch (error) {
    console.warn(`Notion social unavailable. Falling back to local. ${formatNotionError(error)}`);
    return null;
  }
}

export async function fetchNotionWork(force: boolean = false) {
  const databaseId = process.env.NOTION_WORK_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion Work database env vars. Falling back to local MDX.");
    return null;
  }

  const now = Date.now();
  const cache = getCache();
  if (!force && isCacheFresh(cache, "works", now)) {
    return cache.works;
  }

  debugLog("Notion: Fetching work from database...");

  try {
    const dataSource = await resolveDataSource(databaseId, force);
    const filter = buildStatusFilter(dataSource.properties);
    const sorts = buildOrderSort(dataSource.properties);
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
    });

    const works = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page) => {
          const props = page.properties;

          const titleProp = getProp(props, ["名称", "Name", "Title"]);
          const slugProp = getProp(props, ["Slug"]);
          const coverProp = getProp(props, ["cover", "Cover", "封面"]);
          const clientProp = getProp(props, ["Client", "客户"]);
          const roleProp = getProp(props, ["Role", "角色"]);
          const yearProp = getProp(props, ["Year", "年份"]);
          const summaryProp = getProp(props, ["Summary", "摘要"]);
          const coverFitProp = getProp(props, ["CoverFit", "适配"]);
          const tagsProp = getProp(props, ["Tags", "标签"]);
          const orderProp = getProp(props, ["Order", "排序"]);
          const externalLinkProp = getProp(props, ["ExternalLink", "链接"]);

          const title = titleProp?.title?.[0]?.plain_text || "Untitled";
          let slug = slugProp?.rich_text?.[0]?.plain_text || page.id;
          slug = slug.replace(/\s+/g, '-').replace(/[^\w一-龥-]/g, '');

          const client = clientProp?.select?.name;
          const role = roleProp?.rich_text?.[0]?.plain_text;
          const year = yearProp?.rich_text?.[0]?.plain_text;
          const summaryFromProp = summaryProp?.rich_text?.[0]?.plain_text;
          const coverFit = coverFitProp?.select?.name as "cover" | "contain";
          const tags = tagsProp?.multi_select?.map((t: any) => t.name);
          const order = orderProp?.number;
          const externalLink = externalLinkProp?.url;

          let cover: string | undefined;
          if (coverProp?.files?.[0]) {
            const file = coverProp.files[0];
            if (file.type === "file" && file.file?.url) {
              try {
                const url = file.file.url;
                cover = await downloadImage(url, notionFileCacheId(page.id, 0, file.name), force, file.name);
              } catch (e) {}
            } else if (file.type === "external" && file.external?.url) {
              cover = file.external.url;
            }
          }

          const mdResponse = await notion.pages.retrieveMarkdown({ page_id: page.id });
          let content = mdResponse.markdown || "";
          content = content.replace(/<br>/g, "<br/>");
          content = content.replace(/<hr>/g, "<hr/>");
          content = content.replace(/<img([^>]*)>/g, "<img$1/>");
          content = await processNotionImages(content, page.id, force);

          return {
            slug,
            title,
            client,
            role,
            year,
            summary: summaryFromProp || extractSummary(content),
            cover,
            coverFit,
            tags,
            order,
            externalLink,
            content,
          };
        })
    );

    cache.works = works;
    cache.cacheTimes.works = now;
    return works;
  } catch (error) {
    console.warn(`Notion work unavailable. Falling back to local MDX. ${formatNotionError(error)}`);
    return null;
  }
}

export async function fetchNotionPhotos(force: boolean = false) {
  const databaseId = process.env.NOTION_PHOTOS_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.warn("Missing Notion Photos database env vars. Falling back to local photos.");
    return null;
  }

  const now = Date.now();
  const cache = getCache();
  if (!force && isCacheFresh(cache, "photos", now)) {
    return cache.photos;
  }

  debugLog("Notion: Fetching photos from database...");

  try {
    const dataSource = await resolveDataSource(databaseId, force);
    const filter = buildStatusFilter(dataSource.properties);
    const sorts = buildOrderSort(dataSource.properties);
    const response = await notion.dataSources.query({
      data_source_id: dataSource.id,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
    });

    const photos = await Promise.all(
      response.results
        .filter((item): item is { id: string; properties: Record<string, any>; object: "page" } =>
          item.object === "page"
        )
        .map(async (page, index) => {
          const props = page.properties;

          const titleProp = getProp(props, ["名称", "Name", "Title", "Caption"]);
          const fileProp = getProp(props, ["File", "文件", "文件和媒体", "Files & media", "Photo", "Image", "Video"]);
          const externalUrlProp = getProp(props, ["ExternalUrl", "外部链接", "External URL"]);
          const rotateProp = getProp(props, ["Rotate", "旋转", "Rotation"]);
          const leftPctProp = getProp(props, ["LeftPct", "位置", "Left Percent", "Left"]);
          const stringHeightProp = getProp(props, ["StringHeight", "绳长", "String Height"]);
          const widthProp = getProp(props, ["Width", "宽度"]);
          const heightProp = getProp(props, ["Height", "高度"]);
          const zIndexProp = getProp(props, ["ZIndex", "层级", "Z-index", "Z Index"]);
          const fitProp = getProp(props, ["Fit", "适配"]);
          const imageScaleProp = getProp(props, ["ImageScale", "缩放", "Scale"]);
          const hideOnMobileProp = getProp(props, ["HideOnMobile", "移动端隐藏", "Hide on Mobile"]);
          const linkProp = getProp(props, ["Link", "链接", "URL", "External Link"]);

          const caption = titleProp?.title?.[0]?.plain_text || "";

          let src: string | undefined;
          if (fileProp?.files?.[0]) {
            const file = fileProp.files[0];
            if (file.type === "file" && file.file?.url) {
              try {
                const url = file.file.url;
                src = await downloadImage(
                  url,
                  notionFileCacheId(page.id, index, file.name),
                  force,
                  file.name
                );
              } catch (e) {}
            } else if (file.type === "external" && file.external?.url) {
              src = file.external.url;
            }
          }
          if (!src && externalUrlProp?.url) {
            src = externalUrlProp.url;
          }

          return {
            src: src || "",
            caption,
            href: linkProp?.url,
            fit: fitProp?.select?.name as "cover" | "contain",
            imageScale: imageScaleProp?.number,
            rotate: rotateProp?.number ?? 0,
            leftPct: leftPctProp?.number ?? 50,
            stringHeight: stringHeightProp?.number ?? 50,
            width: widthProp?.number ?? 200,
            height: heightProp?.number ?? 200,
            zIndex: zIndexProp?.number ?? index + 1,
            hideOnMobile: hideOnMobileProp?.checkbox ?? false,
          };
        })
    );

    cache.photos = photos;
    cache.cacheTimes.photos = now;
    return photos;
  } catch (error) {
    console.warn(`Notion photos unavailable. Falling back to local photos. ${formatNotionError(error)}`);
    return null;
  }
}
