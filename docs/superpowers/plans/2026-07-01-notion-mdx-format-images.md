# Notion MDX Format Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve Notion-authored bold labels in Work and Blog content while making them visually bold, and lock Notion body images to stable cached site paths.

**Architecture:** Keep Markdown semantics intact in `lib/mdx.ts` instead of converting bold labels into headings. Use CSS for the visual treatment of `strong` in both prose variants, and source-level tests to enforce Notion image caching for both Work and Blog import paths.

**Tech Stack:** Next.js 16, React 19, next-mdx-remote, Notion SDK, plain Node test scripts.

---

### Task 1: MDX Bold Label Semantics

**Files:**
- Modify: `lib/mdx.ts`
- Modify: `tests/mdx-body-rendering.test.cjs`

- [ ] **Step 1: Write the failing test**

Add assertions that `normalizeMdxSource("**流程统一：**正文")` and `normalizeMdxSource("- **按类型过滤：** 正文")` preserve Markdown strong syntax instead of turning labels into headings. Also cover Notion HTML color spans containing Markdown strong, because Markdown inside raw HTML is not parsed by MDX.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected before implementation: FAIL because the current normalizer converts standalone bold-colon labels into `###`.

- [ ] **Step 3: Write minimal implementation**

Update `normalizeMdxSource` so it no longer converts bold-colon labels into headings. Add normalization for Notion color spans such as `<span color="orange">**重点**</span>` into `<strong>重点</strong>` so the emphasis is real HTML/MDX instead of literal asterisks.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected after implementation: PASS.

### Task 2: Strong Visual Treatment

**Files:**
- Modify: `app/globals.css`
- Modify: `tests/mdx-body-rendering.test.cjs`

- [ ] **Step 1: Write the failing test**

Add source assertions that both `.prose-mdx strong` and `.prose-journal strong` exist and use a clearly heavier `font-weight`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected before implementation: FAIL because `.prose-mdx strong` is missing and `.prose-journal strong` is only `600`.

- [ ] **Step 3: Write minimal implementation**

Add shared strong styles for both prose classes with `font-weight: 700` and a small visual emphasis that does not alter layout.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected after implementation: PASS.

### Task 3: Notion Body Image Cache Guard

**Files:**
- Modify: `tests/notion-markdown-image-cache-id.test.cjs`

- [ ] **Step 1: Write the failing test**

Assert that `processNotionImages(content, page.id, force)` is used in both Work and Writing import paths, and that stale S3 image URLs are not intentionally left in Notion Markdown content.

- [ ] **Step 2: Run the test to verify it fails if coverage is incomplete**

Run: `node tests/notion-markdown-image-cache-id.test.cjs`

Expected: PASS on current code if both paths are already covered; FAIL if one content path regresses.

- [ ] **Step 3: Keep implementation minimal**

Only adjust `lib/notion.ts` if the test reveals a real gap. Do not add a second Notion conversion pipeline.

- [ ] **Step 4: Run the full repository test suite**

Run: `npm test`

Expected: PASS.

### Task 4: Adversarial Verification

**Files:**
- No production file changes expected.

- [ ] **Step 1: Verify the supplied Notion page**

Run a one-off script against page `379a8c7bbaa88033b962f58bf9490f49` to count image blocks and Markdown image links.

Expected: Notion block tree reports 12 image blocks and Markdown reports 12 image links.

- [ ] **Step 2: Verify production build status**

Run: `npm run build`

Expected: either PASS, or fail on known Notion data quality such as duplicate Work slugs. If it fails for data quality, report the exact data issue without claiming build success.
