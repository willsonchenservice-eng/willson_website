const pkg = require("../package.json");

if (!pkg.scripts || !pkg.scripts.test) {
  console.error("FAIL: package.json must expose an npm test script.");
  process.exit(1);
}

if (!pkg.scripts.test.includes("tests/run-all.cjs")) {
  console.error("FAIL: npm test must run the repository test runner.");
  process.exit(1);
}

console.log("PASS: package.json exposes the repository test runner.");
