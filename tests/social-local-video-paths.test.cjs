const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(process.cwd(), "lib", "content.ts"), "utf8");
const videoPaths = [...content.matchAll(/src:\s*"([^"]*xhs-[^"]+\.mp4)"/g)].map((match) => match[1]);

if (videoPaths.length < 2) {
  console.error("FAIL: expected local social video paths in lib/content.ts.");
  process.exit(1);
}

let failed = false;

for (const src of videoPaths) {
  const publicPath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  if (!fs.existsSync(publicPath)) {
    console.error(`FAIL: local social video does not exist for src ${src}.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS: local social video paths point to files under public/.");
