# MDX Image Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make work detail and writing detail MDX images clickable for full-size viewing, and render standalone bold colon labels such as `**流程统一：**` as block-level section labels.

**Architecture:** Keep `MdxBody` as a Server Component so `next-mdx-remote/rsc` continues to render remote MDX. Add a small focused Client Component for image click state and modal behavior, and add a pure source normalizer before MDX compilation.

**Tech Stack:** Next.js App Router, React 19, `next-mdx-remote/rsc`, plain Node regression tests.

---

### Task 1: Regression Tests

**Files:**
- Test: `tests/mdx-body-rendering.test.cjs`

- [ ] **Step 1: Write the failing test**

Create tests that require `components/MdxBody.tsx` to import and register `MdxImage`, to normalize standalone bold colon lines through a helper, and require the helper to preserve inline bold text.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected before implementation: FAIL because `MdxImage`, `normalizeMdxSource`, and `components/mdx/MdxImage.tsx` do not exist.

### Task 2: Source Normalizer

**Files:**
- Create: `lib/mdx.ts`
- Modify: `components/MdxBody.tsx`

- [ ] **Step 1: Implement minimal normalizer**

Add `normalizeMdxSource(source: string)` that converts only lines matching `**label：**` or `**label:**` into `### label：` / `### label:`.

- [ ] **Step 2: Wire normalizer into MdxBody**

Pass `normalizeMdxSource(source)` into `MDXRemote`.

### Task 3: Clickable MDX Image

**Files:**
- Create: `components/mdx/MdxImage.tsx`
- Modify: `components/MdxBody.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add client image component**

Render an MDX image as a button containing an image, open a fixed overlay on click, close via overlay button or Escape, and preserve `src` / `alt`.

- [ ] **Step 2: Register image component**

Add `img: MdxImage` to `mdxComponents`.

- [ ] **Step 3: Add focused styles**

Add `.mdx-image-*` styles inside the existing prose section.

### Task 4: Verification

**Files:**
- Test: existing test suite

- [ ] **Step 1: Run targeted regression**

Run: `node tests/mdx-body-rendering.test.cjs`

Expected: PASS.

- [ ] **Step 2: Run full suite**

Run: `npm test`

Expected: all default tests pass.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: static export build exits 0.

- [ ] **Step 4: Browser adversarial verification**

Run the local app, inject a temporary page/content route if needed for image coverage, then verify with browser automation that work and writing pages render clickable images, modal opens, Escape closes, and standalone bold labels render as headings while inline bold stays inline.
