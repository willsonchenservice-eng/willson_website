const fs = require("fs");
const path = require("path");

const dynamicPages = [
  path.join(process.cwd(), "app", "work", "[slug]", "page.tsx"),
  path.join(process.cwd(), "app", "writing", "[slug]", "page.tsx"),
];

let failed = false;

for (const file of dynamicPages) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file);

  if (!/export\s+async\s+function\s+generateStaticParams/.test(source)) {
    console.error(`FAIL: ${relative} must export generateStaticParams for static export.`);
    failed = true;
  }

  if (!/export\s+const\s+dynamicParams\s*=\s*false/.test(source)) {
    console.error(`FAIL: ${relative} must set dynamicParams = false for static export.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS: dynamic detail routes are compatible with static export.");
