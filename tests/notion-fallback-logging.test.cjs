const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "lib", "notion.ts"), "utf8");
const notionCatchBlocks = source.match(/catch \(error\) \{[\s\S]*?return null;\s*\}/g) || [];
const offendingBlocks = notionCatchBlocks.filter((block) => block.includes("console.error"));
const verboseWarnings = notionCatchBlocks.filter((block) => /console\.warn\([^)]*,\s*error\)/.test(block));

if (offendingBlocks.length > 0) {
  console.error(
    `Expected Notion fallback paths to avoid console.error; found ${offendingBlocks.length} catch block(s).`
  );
  process.exit(1);
}

if (verboseWarnings.length > 0) {
  console.error(
    `Expected Notion fallback warnings to avoid logging raw Error objects; found ${verboseWarnings.length} catch block(s).`
  );
  process.exit(1);
}

if (!source.includes("logLevel: LogLevel.ERROR")) {
  console.error("Expected Notion client SDK warnings to be disabled with logLevel: LogLevel.ERROR.");
  process.exit(1);
}

console.log(`OK: ${notionCatchBlocks.length} Notion fallback path(s) avoid console.error.`);
