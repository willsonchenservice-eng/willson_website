# Agent rules for this project

**You MUST read both rule files before doing any work on this repo:**

- [`SOUL.md`](./SOUL.md) — the philosophy. What "complete" means here.
- [`WORKFLOW.md`](./WORKFLOW.md) — the four-stage state machine (0 Clarify → 1 Spec → 2 Skeleton → 3 Per-page → 4 Delivery).

**Hard rules from SOUL.md (do not violate):**

1. No code before the Spec is frozen and the user explicitly confirms.
2. Every "completed" claim must come with a machine-checkable self-check result. "Looks fine" is not a check.
3. Placeholder data (mock URLs, fake emails, `占位文字` markers, `picsum.photos/...`) must NOT live on a path you've claimed is complete. Either replace with real data or list as a known gap.
4. "Unfinished" is a legitimate, encouraged output. Honest gaps beat a false ✅.
5. One page at a time in Stage 3. No batching multiple pages then claiming "done a batch".

**Existing project state (as of 2026-05-14):** Hero (PhotoWall + 文字)、Marquee、Work 列表、3 个 Work 详情页、Blog 流（12 条真实 MDX）、About、Services、BigFooter 都已搭骨架。**未冻结 Spec，未做正式验收**。视觉激进风、番茄红 accent、自托管字体已采用。

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
