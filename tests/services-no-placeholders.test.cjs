const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(process.cwd(), "app", "services", "page.tsx"), "utf8");

const failures = [];

if (/price:\s*["']¥¥["']/.test(source)) {
  failures.push("Services page must not keep placeholder price: ¥¥.");
}

if (/className="flex items-baseline gap-2 text-xs uppercase tracking-\[0\.22em\] text-muted font-mono"\s*>\s*<\/div>/s.test(source)) {
  failures.push("Services page must not render an empty metadata container.");
}

if (/InkUnderline/.test(source) || /HandDivider/.test(source)) {
  failures.push("Services page must not import unused notebook components.");
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log("PASS: Services page has no placeholder price or empty metadata container.");
