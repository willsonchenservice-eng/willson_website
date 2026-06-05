const fs = require("fs");
const path = require("path");
const assert = require("assert");

const source = fs.readFileSync(
  path.join(process.cwd(), "components", "PhotoWall.tsx"),
  "utf8"
);

assert(
  !source.includes("withAutoLayout") && !source.includes("autoLayouts"),
  "PhotoWall layout should come from the local photo data instead of component-side Notion fallbacks."
);

assert(
  source.includes("const mediaFitClass") &&
    source.includes('p.fit === "cover" ? "object-cover" : "object-contain"'),
  "PhotoWall should derive one shared media fit class for images, GIFs, and videos."
);

assert(
  source.includes("const isGif") &&
    source.includes("<img") &&
    source.includes("data-photowall-gif-loop") &&
    !source.includes("StableGifImage"),
  "PhotoWall should render GIFs as looping images without converting them to static posters."
);

assert(
  source.includes('preload="auto"'),
  "PhotoWall videos should preload enough data to avoid blank frames when looping above the fold."
);

assert(
  !/blur\(/.test(source),
  "PhotoWall should not apply Gaussian blur to background photos."
);

console.log("photowall media rendering safeguards are present");
