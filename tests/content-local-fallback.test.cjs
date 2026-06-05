const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

const source = fs.readFileSync(path.join(process.cwd(), "lib", "content.ts"), "utf8");

assert(
  source.includes("mergeBySlug"),
  "Content layer should merge remote Notion entries with local MDX by slug."
);

assert(
  source.includes("readLocalWorkFull") && source.includes("readLocalWritingFull"),
  "Content layer should keep explicit local Work/Writing fallbacks."
);

assert(
  source.includes("mergeBySlug(localWorks, notionWorks)") &&
    source.includes("mergeBySlug(localWritings, notionWritings)"),
  "Notion Work/Writing should augment local content instead of replacing it wholesale."
);

console.log("OK: content layer keeps local MDX as a slug fallback when Notion is enabled.");
