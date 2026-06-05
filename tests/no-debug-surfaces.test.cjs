const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert");

const appApiDir = path.join(process.cwd(), "app", "api");
const apiRoutes = fs.existsSync(appApiDir)
  ? fs
      .readdirSync(appApiDir, { recursive: true })
      .map(String)
      .filter((route) => route.endsWith("route.ts"))
  : [];

assert(
  !apiRoutes.some((route) => route.startsWith("test-")),
  "Public test/debug API route handlers should not be present in app/api."
);

const writingDetail = fs.readFileSync(
  path.join(process.cwd(), "app", "writing", "[slug]", "page.tsx"),
  "utf8"
);

assert(
  !writingDetail.includes("WritingDetail Debug") &&
    !writingDetail.includes("Available slugs") &&
    !writingDetail.includes("Requested slug"),
  "Writing detail page should not log debug slug information in production code."
);

console.log("OK: no public debug API routes or writing detail debug logs.");
