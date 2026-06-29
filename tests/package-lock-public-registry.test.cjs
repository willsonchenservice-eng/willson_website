const fs = require("node:fs");
const path = require("node:path");

const lockfile = fs.readFileSync(path.join(process.cwd(), "package-lock.json"), "utf8");

if (lockfile.includes("bnpm.byted.org")) {
  console.error("FAIL: package-lock.json must not pin packages to the internal bnpm registry.");
  process.exit(1);
}

if (!lockfile.includes("registry.npmjs.org")) {
  console.error("FAIL: package-lock.json must use the public npm registry for GitHub Actions.");
  process.exit(1);
}

console.log("PASS: package-lock.json uses the public npm registry.");
