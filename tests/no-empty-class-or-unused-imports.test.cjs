const fs = require("fs");
const path = require("path");

const checks = [
  {
    file: path.join(process.cwd(), "components", "Hero.tsx"),
    disallow: [/className=""\s*/, /import Stamp from/],
  },
  {
    file: path.join(process.cwd(), "app", "work", "[slug]", "page.tsx"),
    disallow: [/import Stamp from/],
  },
];

let failed = false;

for (const check of checks) {
  const source = fs.readFileSync(check.file, "utf8");
  const relative = path.relative(process.cwd(), check.file);
  for (const pattern of check.disallow) {
    if (pattern.test(source)) {
      console.error(`FAIL: ${relative} contains ${pattern}.`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS: no empty className or known unused imports remain.");
