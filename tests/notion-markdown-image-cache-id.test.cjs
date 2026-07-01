const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(process.cwd(), "lib", "notion.ts"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

assert(
  /processNotionImages\(\s*markdown:\s*string,\s*pageId:\s*string/.test(source),
  "processNotionImages must accept the source page id."
);

assert(
  !source.includes('notionFileCacheId(`markdown-${index}`, index, filename)'),
  "Markdown image cache ids must not be based only on image index and filename."
);

assert(
  source.includes("notionFileCacheId(pageId, index, filename)"),
  "Markdown image cache ids must include the source page id."
);

assert(
  source.includes("processNotionImages(content, page.id, force)"),
  "Notion content imports must pass the page id into markdown image processing."
);

const contentImageProcessingCalls = source.match(/content\s*=\s*await\s+processNotionImages\(content,\s*page\.id,\s*force\)/g) || [];
assert(
  contentImageProcessingCalls.length >= 2,
  "Both Work and Writing Notion body content must pass through markdown image caching."
);

assert(
  !/content\s*=\s*mdResponse\.markdown\s*\|\|\s*"";[\s\S]{0,260}return\s*\{[\s\S]{0,260}content,/.test(source),
  "Notion Markdown content must not be returned before image URLs are cached."
);

if (!process.exitCode) {
  console.log("PASS: Notion markdown image cache ids include page identity.");
}
