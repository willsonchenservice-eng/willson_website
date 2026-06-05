const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
const build = pkg.scripts && pkg.scripts.build;

if (build !== "next build --webpack") {
  console.error(`FAIL: package.json build script must use webpack. Found: ${build}`);
  process.exit(1);
}

console.log("PASS: package.json build script uses webpack.");
