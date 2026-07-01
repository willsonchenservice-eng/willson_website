"use client";

import { useEffect, useId, useState } from "react";

type MdxImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export default function MdxImage({ src, alt = "", ...props }: MdxImageProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!src) {
    return <img alt={alt} {...props} />;
  }

  return (
    <span className="mdx-image-root">
      <button
        type="button"
        className="mdx-image-trigger"
        onClick={() => setOpen(true)}
        aria-label={alt ? `查看大图：${alt}` : "查看大图"}
      >
        <img src={src} alt={alt} {...props} />
      </button>

      {open && (
        <span
          className="mdx-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="mdx-image-backdrop"
            aria-label="关闭大图"
            onClick={() => setOpen(false)}
          />
          <span className="mdx-image-frame">
            <img src={src} alt={alt} className="mdx-image-full" />
            <span id={titleId} className="mdx-image-caption">
              {alt || "图片预览"}
            </span>
            <button
              type="button"
              className="mdx-image-close"
              aria-label="关闭大图"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
