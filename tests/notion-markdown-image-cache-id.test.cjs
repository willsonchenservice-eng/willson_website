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

if (!process.exitCode) {
  console.log("PASS: Notion markdown image cache ids include page identity.");
}
