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
    ['node-version: "22"', "workflow must use Node.js 22 to avoid deprecated runner Node/npm behavior."],
    ["cache: npm", "workflow must enable npm dependency caching."],
    ["npm ci", "workflow must install dependencies from package-lock.json."],
    ["npm exec -- next --version", "workflow must verify the Next.js CLI exists after dependency install."],
    ["npm test", "workflow must run repository quality tests."],
    ["npm run build", "workflow must run the production build."],
    ["NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}", "production build must receive the Notion API key from secrets."],
    ["NOTION_WORK_DATABASE_ID: ${{ secrets.NOTION_WORK_DATABASE_ID }}", "production build must receive the Notion Work database id from secrets."],
    ["NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}", "production build must receive the Notion Writing database id from secrets."],
  ];

  for (const [fragment, message] of requiredFragments) {
    if (!source.includes(fragment)) fail(message);
  }

  if (/peaceiris\/actions-gh-pages|github-pages|deploy/i.test(source)) {
    fail("quality workflow must not deploy or publish artifacts.");
  }

  const allowedSecrets = new Set(["NOTION_API_KEY", "NOTION_WORK_DATABASE_ID", "NOTION_DATABASE_ID"]);
  const secretReferences = [...source.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((match) => match[1]);
  for (const secret of secretReferences) {
    if (!allowedSecrets.has(secret)) {
      fail(`quality workflow must not depend on unrelated repository secret ${secret}.`);
    }
  }
}

if (!process.exitCode) {
  console.log("PASS: GitHub quality workflow gates pull requests without deploying.");
}
