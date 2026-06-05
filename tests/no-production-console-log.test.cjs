const fs = require("fs");
const path = require("path");

const files = [
  path.join(process.cwd(), "lib", "content.ts"),
  path.join(process.cwd(), "lib", "notion.ts"),
];

let failed = false;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file);
  if (/console\.log\(/.test(source)) {
    console.error(`FAIL: ${relative} must not call console.log on production paths.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS: production data paths do not call console.log.");
