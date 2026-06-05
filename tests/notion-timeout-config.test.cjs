const fs = require("fs");
const path = require("path");

const notionPath = path.join(process.cwd(), "lib", "notion.ts");
const source = fs.readFileSync(notionPath, "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

assert(
  /NOTION_TIMEOUT_MS/.test(source) && /timeoutMs:\s*NOTION_TIMEOUT_MS/.test(source),
  "Notion client must use a bounded timeoutMs configuration"
);

assert(
  /NOTION_MAX_RETRIES/.test(source) &&
    /retry:\s*NOTION_MAX_RETRIES\s*===\s*0\s*\?\s*false\s*:\s*\{\s*maxRetries:\s*NOTION_MAX_RETRIES/.test(source),
  "Notion client must use a bounded retry configuration"
);

assert(
  /NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS/.test(source) && /\.setTimeout\(\s*NOTION_IMAGE_DOWNLOAD_TIMEOUT_MS/.test(source),
  "Notion image downloads must have a request timeout"
);

assert(
  !/cache\.writings\s*=\s*writings;\s*\n\s*cache\.writings\s*=\s*writings;/.test(source),
  "fetchNotionWriting must not assign cache.writings twice"
);

if (!process.exitCode) {
  console.log("PASS: Notion timeout configuration is bounded.");
}
