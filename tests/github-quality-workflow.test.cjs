const fs = require("node:fs");
const path = require("node:path");

const workflowPath = path.join(process.cwd(), ".github", "workflows", "quality.yml");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(workflowPath)) {
  fail("Quality workflow must exist at .github/workflows/quality.yml.");
} else {
  const source = fs.readFileSync(workflowPath, "utf8");

  const requiredFragments = [
    ["name: Quality Check", "workflow must be named Quality Check."],
    ["pull_request:", "workflow must run for pull requests."],
    ["branches: [main]", "pull request workflow must target main."],
    ["workflow_dispatch:", "workflow must support manual dispatch."],
    ["permissions:", "workflow must declare limited permissions."],
    ["contents: read", "workflow must only need read access to repository contents."],
    ["actions/checkout@v4", "workflow must check out the repository."],
    ["actions/setup-node@v4", "workflow must configure Node.js."],
    ['node-version: "20"', "workflow must use Node.js 20."],
    ["cache: npm", "workflow must enable npm dependency caching."],
    ["npm ci", "workflow must install dependencies from package-lock.json."],
    ["npm test", "workflow must run repository quality tests."],
    ["npm run build", "workflow must run the production build."],
  ];

  for (const [fragment, message] of requiredFragments) {
    if (!source.includes(fragment)) fail(message);
  }

  if (/peaceiris\/actions-gh-pages|github-pages|deploy/i.test(source)) {
    fail("quality workflow must not deploy or publish artifacts.");
  }

  if (/secrets\./.test(source)) {
    fail("quality workflow must not depend on repository secrets.");
  }
}

if (!process.exitCode) {
  console.log("PASS: GitHub quality workflow gates pull requests without deploying.");
}
