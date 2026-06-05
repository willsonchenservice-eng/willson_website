const fs = require("fs");
const path = require("path");
const assert = require("assert");

const source = fs.readFileSync(path.join(process.cwd(), "lib", "content.ts"), "utf8");

assert(
  !source.includes("fetchNotionPhotos"),
  "PhotoWall should not import or call fetchNotionPhotos when assets are managed locally."
);

const photoBlock = source.match(/const localPhotos: Photo\[] = \[([\s\S]*?)\];/);
assert(!photoBlock, "PhotoWall should not keep a hand-written localPhotos list when public/wall is the source.");

assert(
  source.includes("getWallFiles") &&
    source.includes("public\", \"wall") &&
    source.includes("supportedWallAssetPattern"),
  "PhotoWall should scan public/wall for supported local media assets."
);

const wallDir = path.join(process.cwd(), "public", "wall");
const expectedFiles = fs
  .readdirSync(wallDir)
  .filter((file) => /\.(png|jpe?g|webp|gif|mp4|webm|mov)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, "en"));

assert(expectedFiles.length >= 1, "public/wall should contain at least one supported asset for PhotoWall.");

for (const file of expectedFiles) {
  assert(
    source.includes(file),
    `PhotoWall metadata should include a stable caption/order entry or fallback coverage for ${file}.`
  );
}

assert(
  source.includes("return localPhotos;") &&
    !source.includes("getAllPhotos: Trying Notion"),
  "getAllPhotos should return the local PhotoWall configuration directly without Notion."
);

console.log(`OK: PhotoWall is sourced from public/wall (${expectedFiles.length} assets).`);
