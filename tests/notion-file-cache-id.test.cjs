const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "lib", "notion.ts"), "utf8");

function expectSource(fragment, message) {
  if (!source.includes(fragment)) {
    console.error(message);
    process.exit(1);
  }
}

expectSource("notionFileCacheId", "Expected a stable Notion file cache id helper.");
expectSource("page.id, 0, file.name", "Expected page file downloads to include page id and file name.");
expectSource("page.id, index, file.name", "Expected PhotoWall downloads to include page id, index, and file name.");
expectSource("img-${index}", "Expected markdown image downloads to include image index.");

if (source.includes("parts.find(p => uuidRegex.test(p))")) {
  console.error("Expected file cache ids not to use the first UUID from Notion S3 URLs.");
  process.exit(1);
}

console.log("OK: Notion file cache ids are unique per page/file instead of shared S3 UUID.");
