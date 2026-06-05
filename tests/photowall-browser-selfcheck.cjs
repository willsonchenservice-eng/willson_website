const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("/Users/bytedance/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const wallAssetMeta = {
  "me-2025.mp4": { label: "Me, 2025", order: 10 },
  "feishu_security.png": { label: "飞书安全", order: 20 },
  "feishu_openplatform.png": { label: "飞书开放平台", order: 30 },
  "beijiang.png": { label: "北疆 Vlog", order: 40 },
  "stickers.gif": { label: "表情包", order: 50 },
  "douyin-reviewer-care.png": { label: "审核员关怀", order: 60 },
  "douyin-review.png": { label: "抖音审核", order: 70 },
  "huijian.JPG": { label: "回见", order: 80 },
};

function fallbackLabel(file) {
  return file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const expectedAssets = fs
  .readdirSync(path.join(process.cwd(), "public", "wall"))
  .filter((file) => /\.(png|jpe?g|webp|gif|mp4|webm|mov)$/i.test(file))
  .sort((a, b) => {
    const orderA = wallAssetMeta[a]?.order ?? 999;
    const orderB = wallAssetMeta[b]?.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, "en");
  })
  .map((file) => ({
    file,
    label: wallAssetMeta[file]?.label ?? fallbackLabel(file),
  }));

const expected = expectedAssets.map((asset) => asset.label);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1442, height: 1233 } });

  await page.goto("http://localhost:3000/?verify=photowall-rollback-original-layout", {
    waitUntil: "networkidle",
  });
  await page.waitForSelector(".photo-wall");
  await page.waitForTimeout(1200);

  const result = await page.evaluate(async (expectedLabels) => {
    const media = [...document.querySelectorAll(".photo-wall video, .photo-wall img")].map((el) => ({
      tag: el.tagName.toLowerCase(),
      label: el.getAttribute("aria-label") || el.getAttribute("alt"),
      src: el.currentSrc || el.getAttribute("src"),
      complete: el.tagName === "IMG" ? el.complete : true,
      naturalWidth: el.tagName === "IMG" ? el.naturalWidth : 1,
      loop: el.tagName === "VIDEO" ? el.loop : undefined,
      paused: el.tagName === "VIDEO" ? el.paused : undefined,
      box: {
        width: Math.round(el.offsetWidth),
        height: Math.round(el.offsetHeight),
      },
    }));
    const cardRects = [...document.querySelectorAll(".photo-wall div.absolute.left-1\\/2.bg-white")].map((el) => {
      const label = el.textContent.trim();
      return {
        label,
        width: Math.round(el.offsetWidth),
        height: Math.round(el.offsetHeight),
      };
    });
    const cardFilters = [...document.querySelectorAll(".photo-wall div.absolute.left-1\\/2.bg-white")].map((el) =>
      getComputedStyle(el).filter
    );

    const video = document.querySelector(".photo-wall video");
    let videoLoops = true;
    if (video) {
      if (Number.isFinite(video.duration) && video.duration > 1) {
        video.currentTime = video.duration - 0.25;
      }
      await video.play().catch(() => {});
      const before = video.currentTime;
      await new Promise((resolve) => setTimeout(resolve, 900));
      videoLoops = video.loop && !video.paused && video.currentTime < before + 0.9;
    }

    return {
      labels: media.map((item) => item.label),
      mediaCount: media.length,
      expectedOrder: media.map((item) => item.label).join("|") === expectedLabels.join("|"),
      allLocalWall: media.every((item) => item.src.includes("/wall/")),
      noNotionImages: media.every((item) => !item.src.includes("notion") && !item.src.includes("amazonaws")),
      allImagesComplete: media.filter((item) => item.tag === "img").every((item) => item.complete && item.naturalWidth > 0),
      noComputedBlur: cardFilters.every((filter) => !filter.includes("blur")),
      cardFilters,
      cardRects,
      allExpectedFilesRendered: expectedLabels.every((label) => media.some((item) => item.label === label)),
      landscapeFrameFollowsContent: cardRects.some(
        (card) => card.label.includes("北疆 Vlog") && card.width > card.height
      ),
      mediaAreaBalanceRatio:
        Math.max(...media.map((item) => item.box.width * item.box.height)) /
        Math.min(...media.map((item) => item.box.width * item.box.height)),
      squareStickerMediaIsNearSquare: media.some((item) => {
        if (item.label !== "表情包") return false;
        return Math.abs(item.box.width - item.box.height) <= 12;
      }),
      videoLoops,
      hasRuntimeErrorText: document.body.innerText.includes("Runtime Error"),
      media,
    };
  }, expected);

  await page.screenshot({
    path: "/private/tmp/photowall-rollback-original-layout.png",
    fullPage: false,
  });
  await browser.close();

  console.log(JSON.stringify(result, null, 2));

  assert.strictEqual(result.mediaCount, expected.length, "PhotoWall should render every supported local wall asset.");
  assert.deepStrictEqual(result.labels, expected, "PhotoWall should render every supported public/wall asset in stable order.");
  assert.strictEqual(result.expectedOrder, true, "PhotoWall order should match the stable public/wall order.");
  assert.strictEqual(result.allExpectedFilesRendered, true, "PhotoWall should render every expected public/wall asset.");
  assert.strictEqual(result.allLocalWall, true, "PhotoWall media should be loaded from /wall.");
  assert.strictEqual(result.noNotionImages, true, "PhotoWall media should not load Notion-hosted assets.");
  assert.strictEqual(result.allImagesComplete, true, "PhotoWall images should load successfully.");
  assert.strictEqual(result.noComputedBlur, true, "PhotoWall cards should not have computed Gaussian blur.");
  assert.strictEqual(result.landscapeFrameFollowsContent, true, "Landscape artwork should use a landscape shell that follows content ratio.");
  assert(
    result.mediaAreaBalanceRatio <= 1.65,
    `PhotoWall media areas should feel balanced; got ratio ${result.mediaAreaBalanceRatio.toFixed(2)}.`
  );
  assert.strictEqual(result.squareStickerMediaIsNearSquare, true, "Square artwork should keep a near-square media frame.");
  assert.strictEqual(result.videoLoops, true, "PhotoWall video should loop and keep playing.");
  assert.strictEqual(result.hasRuntimeErrorText, false, "Page should not show a runtime error.");

})();
