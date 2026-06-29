const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(process.cwd(), "lib", "notion.ts"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
}

function functionBody(name) {
  const marker = `export async function ${name}`;
  const start = source.indexOf(marker);
  assert(start >= 0, `${name} must exist.`);
  if (start < 0) return "";

  const next = source.indexOf("\nexport async function ", start + marker.length);
  return source.slice(start, next === -1 ? source.length : next);
}

for (const name of [
  "fetchNotionWriting",
  "fetchNotionBeliefs",
  "fetchNotionSocial",
  "fetchNotionWork",
  "fetchNotionPhotos",
]) {
  const body = functionBody(name);
  assert(
    body.includes("resolveDataSource(databaseId, force)"),
    `${name} must resolve configured database IDs to data source IDs before querying.`
  );
  assert(
    !body.includes("data_source_id: databaseId"),
    `${name} must not pass the configured database ID directly as a data source ID.`
  );
}

assert(
  source.includes("cacheTimes") && !/time:\s*0/.test(source),
  "Notion cache must track freshness per collection instead of one shared timestamp."
);

for (const key of ["writings", "works", "photos", "beliefs", "social"]) {
  assert(
    source.includes(`cache.cacheTimes.${key}`),
    `Notion cache must use an independent timestamp for ${key}.`
  );
}

if (!process.exitCode) {
  console.log("PASS: Notion data source resolution and cache boundaries are explicit.");
}
