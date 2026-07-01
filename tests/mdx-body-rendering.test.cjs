const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const mdxBodyPath = path.join(root, "components", "MdxBody.tsx");
const mdxImagePath = path.join(root, "components", "mdx", "MdxImage.tsx");
const mdxUtilPath = path.join(root, "lib", "mdx.ts");
const globalsPath = path.join(root, "app", "globals.css");

const mdxBody = fs.readFileSync(mdxBodyPath, "utf8");
const globals = fs.readFileSync(globalsPath, "utf8");

let failed = false;

function expect(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed = true;
  }
}

expect(
  fs.existsSync(mdxImagePath),
  "MDX rendering must provide a client-side image component for clickable full-size viewing."
);

expect(
  fs.existsSync(mdxUtilPath),
  "MDX rendering must provide a source normalizer for standalone bold colon labels."
);

expect(
  /import\s+MdxImage\s+from\s+["']@\/components\/mdx\/MdxImage["']/.test(mdxBody),
  "MdxBody must import MdxImage."
);

expect(
  /img\s*:\s*MdxImage/.test(mdxBody),
  "MdxBody must register MdxImage for Markdown and HTML img nodes."
);

expect(
  /normalizeMdxSource\(source\)/.test(mdxBody),
  "MdxBody must normalize source before passing it to MDXRemote."
);

if (fs.existsSync(mdxImagePath)) {
  const mdxImage = fs.readFileSync(mdxImagePath, "utf8");

  expect(
    /^["']use client["'];?/m.test(mdxImage),
    "MdxImage must be a Client Component because click state and Escape handling require browser APIs."
  );

  expect(
    /onClick=\{\(\)\s*=>\s*setOpen\(true\)\}/.test(mdxImage) ||
      /onClick=\{openViewer\}/.test(mdxImage),
    "MdxImage must open the full-size viewer on click."
  );

  expect(
    /Escape/.test(mdxImage),
    "MdxImage must support Escape to close the full-size viewer."
  );

  expect(
    /aria-modal="true"/.test(mdxImage),
    "MdxImage full-size viewer must expose modal semantics."
  );
}

if (fs.existsSync(mdxUtilPath)) {
  const mdxUtil = fs.readFileSync(mdxUtilPath, "utf8");

  expect(
    /export\s+function\s+normalizeMdxSource/.test(mdxUtil),
    "lib/mdx.ts must export normalizeMdxSource."
  );

  const compiled = require("typescript").transpileModule(mdxUtil, {
    compilerOptions: { module: require("typescript").ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", compiled)(module, module.exports);
  const { normalizeMdxSource } = module.exports;

  if (typeof normalizeMdxSource === "function") {
    expect(
      normalizeMdxSource("**流程统一：**正文") === "**流程统一：**正文",
      "Paragraph-leading bold labels must keep Markdown strong semantics instead of becoming headings."
    );

    expect(
      normalizeMdxSource("**流程统一：**\n正文") === "**流程统一：**\n正文",
      "Standalone bold labels must keep Markdown strong semantics instead of becoming headings."
    );

    expect(
      normalizeMdxSource("前文 **流程统一：** 后文") === "前文 **流程统一：** 后文",
      "Inline bold labels inside normal prose must remain inline Markdown."
    );

    expect(
      normalizeMdxSource("- **流程统一：** 列表项") === "- **流程统一：** 列表项",
      "Bold labels inside list items must remain list content."
    );

    expect(
      normalizeMdxSource('<span color="orange">**流程统一：**正文</span>') ===
        "**流程统一：**正文",
      "Notion color spans containing Markdown strong must be unwrapped so MDX can parse the Markdown emphasis."
    );
  }
}

expect(
  /\.prose-mdx\s+strong\s*,\s*\n\.prose-journal\s+strong\s*\{[\s\S]*font-weight:\s*700/.test(globals) ||
    /\.prose-journal\s+strong\s*,\s*\n\.prose-mdx\s+strong\s*\{[\s\S]*font-weight:\s*700/.test(globals),
  "Both Blog and Work prose containers must style strong text with a clearly bold weight."
);

if (failed) {
  process.exit(1);
}

console.log("PASS: MDX body registers clickable images and normalizes standalone bold colon labels.");
