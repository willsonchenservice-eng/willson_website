import Image from "next/image";
import { site } from "@/lib/site";
import WashiTape from "@/components/notebook/WashiTape";

/**
 * "Contact card stuck into the notebook" — tilts slightly, has washi tape
 * across the top, and the QR sits like a polaroid pinned beside.
 */
export default function ContactBlock() {
  return (
    <div className="relative my-12" style={{ transform: "rotate(-0.6deg)" }}>
      {/* washi tape across the top — looks like the card is taped onto the page */}
      <div className="flex justify-center mb-[-0.85rem] relative z-10">
        <WashiTape color="pink" width="180px" rotate={-3} />
      </div>

      <div
        className="bg-white border border-line shadow-[0_14px_30px_-12px_rgba(0,0,0,0.18)]"
        style={{ padding: "2rem 2rem 1.75rem 2rem" }}
      >
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          {/* QR as a mini polaroid */}
          <div
            className="shrink-0 bg-white p-2 pb-4 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.18)]"
            style={{ transform: "rotate(-3deg)" }}
          >
            <Image
              src={site.wechatQr}
              alt="WeChat QR"
              width={130}
              height={130}
              className="block"
            />
            <div
              className="text-center mt-2 text-foreground/70"
              style={{ fontFamily: "var(--font-hand)", fontSize: "0.95rem" }}
            >
              微信扫码
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="leading-tight mb-3"
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "2.25rem",
                color: "var(--foreground)",
                display: "inline-block",
              }}
            >
              扫码添加我的联系方式。
            </div>
            <p className="text-sm text-muted leading-relaxed">
              一般在 24 小时内回复
            </p>
            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-5 text-base items-baseline">
              <span className="text-muted text-sm">
                邮箱 ·{" "}
                <a
                  href={`mailto:${site.email}`}
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.15rem",
                    color: "var(--foreground)",
                  }}
                  className="hover:text-[var(--red-pen)] transition-colors"
                >
                  {site.email}
                </a>
              </span>
              <span className="text-muted text-sm">
                微信 ·{" "}
                <span
                  style={{
                    fontFamily: "var(--font-hand)",
                    fontSize: "1.15rem",
                    color: "var(--foreground)",
                  }}
                >
                  {site.wechatId}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
