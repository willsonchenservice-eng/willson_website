const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

const source = fs.readFileSync(path.join(process.cwd(), "lib", "content.ts"), "utf8");
const notionSource = fs.readFileSync(path.join(process.cwd(), "lib", "notion.ts"), "utf8");

assert(
  !source.includes("readLocalWorkFull") && !source.includes("readLocalWritingFull"),
  "Work and Writing must not keep local MDX readers in the production content layer."
);

assert(
  !source.includes('readCollection("work")') && !source.includes('readCollection("writing")'),
  "Work and Writing must not read content/work or content/writing from production code."
);

assert(
  !source.includes("mergeBySlug(localWorks, notionWorks)") &&
    !source.includes("mergeBySlug(localWritings, notionWritings)"),
  "Notion Work/Writing must replace local fallback behavior instead of augmenting local MDX."
);

assert(
  !fs.existsSync(path.join(process.cwd(), "content", "work")) &&
    !fs.existsSync(path.join(process.cwd(), "content", "writing")),
  "Local Work/Writing MDX fixture directories must be removed to avoid production-source ambiguity."
);

assert(
  !/Notion (?:work|writing) unavailable\. Falling back to local MDX/.test(notionSource) &&
    !/Missing Notion (?:Work database env vars|environment variables)\. Falling back to local MDX/.test(notionSource),
  "Work/Writing Notion warnings must not claim a local MDX fallback exists."
);

assert(
  source.includes("Notion Work content is required") &&
    source.includes("Notion Writing content is required"),
  "Work/Writing must fail with a clear required-Notion-data error instead of silently returning local or empty data."
);

assert(
  source.includes("assertUniqueSlugs(works, \"Work\")") &&
    source.includes("assertUniqueSlugs(writings, \"Writing\")") &&
    source.includes("Duplicate Notion"),
  "Work/Writing must fail fast when Notion returns duplicate slugs for dynamic routes."
);

console.log("PASS: Work and Writing production content comes from Notion only.");
