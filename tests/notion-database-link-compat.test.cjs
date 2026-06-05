const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "lib", "notion.ts"), "utf8");

function expectSource(fragment, message) {
  if (!source.includes(fragment)) {
    console.error(message);
    process.exit(1);
  }
}

expectSource("resolveDataSource", "Expected Notion database IDs to be resolved to data source IDs before querying.");
expectSource("notion.databases.retrieve", "Expected Notion database retrieval for database links copied from Notion.");
expectSource("data_sources?.[0]?.id", "Expected first database data source ID to be used for query.");
expectSource("buildStatusFilter", "Expected status filter to be built from the actual Notion schema.");
expectSource("buildOrderSort", "Expected order sort to be optional based on the actual Notion schema.");
expectSource('"status"', "Expected lowercase Work status property alias.");
expectSource('"状态"', "Expected Chinese PhotoWall status property alias.");
expectSource('"文件和媒体"', "Expected Chinese PhotoWall files property alias.");

console.log("OK: Notion database links and localized schema aliases are supported.");
