"use client";

import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";
import PhotoWall from "@/components/PhotoWall";
import StickyNote from "@/components/notebook/StickyNote";
import Doodle from "@/components/notebook/Doodle";
import InkUnderline from "@/components/notebook/InkUnderline";
import type { Photo } from "@/lib/content";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ photos }: { photos: Photo[] }) {
  const reduced = useReducedMotion();

  return (
    <section className="relative pt-1 sm:pt-2 pb-4 sm:pb-6">
      {/* Photos hanging above the flyleaf */}
      <PhotoWall photos={photos} />

      {/* The flyleaf itself */}
      <div className="notebook-shell mt-4 sm:mt-8 relative">
        {/* grid: greeting + name (left)  ·  sticky note (right) */}
        <div className="grid lg:grid-cols-12 gap-y-6 gap-x-10 items-start">
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease }}
            className="lg:col-span-8 min-w-0"
          >
            <p className="serif text-2xl sm:text-3xl text-muted">
              Hello, 我是
            </p>

            <h1
              className="leading-[0.95] mt-2 -ml-1"
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "clamp(4rem, 11vw, 8rem)",
                color: "var(--foreground)",
                transform: "rotate(-1.5deg)",
                letterSpacing: "-0.01em",
              }}
            >
              {site.name}
              <span style={{ color: "var(--red-pen)" }}>.</span>
            </h1>

            <p className="serif text-xl sm:text-2xl mt-6 leading-snug max-w-2xl">
              一个产品设计师、
              <InkUnderline>
                <span>独立开发者</span>
              </InkUnderline>
              。
              <br />
              理想是持续做出给用户带来幸福、
              <InkUnderline thickness={2.4}>会心一笑</InkUnderline>
              的产品。
            </p>
          </motion.div>

          {/* sticky note: today's focus */}
          <motion.div
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 24, rotate: -6 }
            }
            animate={{ opacity: 1, y: 0, rotate: 2.4 }}
            transition={{ duration: 1.0, delay: 1.15, ease }}
            className="lg:col-span-4 flex justify-start lg:justify-end"
            style={{ transformOrigin: "top right" }}
          >
            <StickyNote color="yellow" rotate={0}>
              <div
                className="leading-snug"
                style={{
                  fontFamily: 'Helvetica, "Courier New", Courier, monospace',
                  fontSize: "1.5rem",
                  color: "var(--foreground)",
                }}
              >
                目前在做独立开发，
                <br />
                前段时间上线了
                <br />
                iOS App{" "}
                <span style={{ color: "var(--red-pen)" }}>「回见」</span>
              </div>
            </StickyNote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
