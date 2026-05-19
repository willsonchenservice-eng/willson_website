import ContactBlock from "@/components/ContactBlock";
import Chapter from "@/components/notebook/Chapter";
import Stamp from "@/components/notebook/Stamp";
import WashiTape from "@/components/notebook/WashiTape";
import PaperClip from "@/components/notebook/PaperClip";
import InkUnderline from "@/components/notebook/InkUnderline";
import Doodle from "@/components/notebook/Doodle";
import HandDivider from "@/components/notebook/HandDivider";

export const metadata = { title: "Services" };

const service = {
  title: "作品集咨询",
  tagline: "一对一，把你的作品集从「自我陈述」翻成「招聘方读得懂的故事」。",
  duration: "60 分钟",
  price: "¥¥",
  desc: "针对你的作品集做一次深度复盘：哪些项目值得写、写法怎么调、视觉怎么收。适合在准备跳槽、转岗或申请海外硕士的同学。",
  deliver: [
    "一份逐项批注的 PDF",
    "一次 60 分钟视频沟通",
    "后续一周内邮件追问",
  ],
};

const flow = [
  "加微信或邮件，告诉我你的诉求、当前阶段、希望的时间。",
  "我评估能不能帮上，给你报价和排期。不合适会直接说。",
  "确认后预付 50%，约定时间。结束后交付材料、结清尾款。",
];

export default function Services() {
  return (
    <div className="notebook-shell py-10 sm:py-14">
      <Chapter
        title={
          <>
            作品集咨询或项目合作
          </>
        }
        arrow={false}
        meta={
          <span>
            面向在校学生、职场跳槽等场景进行作品集咨询
          </span>
        }
      />

      <HandDivider className="my-8" />

      {/* The order form — tilted, taped, paperclipped */}
      <section className="mt-8 mb-12">
        <div
          className="relative bg-white border border-line shadow-[0_18px_36px_-14px_rgba(0,0,0,0.18)]"
          style={{ transform: "rotate(-0.6deg)", padding: "2.25rem 2rem" }}
        >
          {/* washi tape top-left */}
          <div className="absolute -top-3 left-10">
            <WashiTape color="yellow" width="160px" rotate={-3} />
          </div>
          {/* paperclip top-right */}
          <PaperClip
            size={48}
            color="#444"
            rotate={20}
            className="absolute -top-3 right-12 z-10"
          />

          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
            <div className="flex items-baseline gap-2 text-xs uppercase tracking-[0.22em] text-muted font-mono">
              
            </div>
            <div className="flex items-center gap-2">
              <Stamp size="sm" color="var(--foreground)" rotate={-3}>
                {service.duration}
              </Stamp>
              <Stamp size="sm" color="var(--red-pen)" rotate={2}>
                价格私聊
              </Stamp>
            </div>
          </div>

          <h2
            className="leading-tight mb-4"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
              letterSpacing: "-0.01em",
            }}
          >
            {service.title}
            
          </h2>

          <p className="text-xl leading-relaxed text-muted mb-8 max-w-3xl">
            {service.tagline}
          </p>

          <div className="border-t border-line pt-6 mb-6">
            <p className="text-base leading-relaxed text-foreground/85 mb-6">
              {service.desc}
            </p>

            <div>
              <div
                className="mb-3 text-foreground/70"
                style={{ fontFamily: "var(--font-hand)", fontSize: "1.3rem" }}
              >
                你会拿到 →
              </div>
              <ul className="space-y-2">
                {service.deliver.map((d, i) => (
                  <li
                    key={d}
                    className="flex items-start gap-3 text-base"
                  >
                    <Stamp
                      size="xs"
                      color="var(--red-pen)"
                      rotate={i % 2 === 0 ? -4 : 3}
                      className="mt-0.5 shrink-0"
                    >
                      ✓
                    </Stamp>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* signature line */}
          <div className="mt-8 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted mb-1">
                Signed by
              </div>
              <div
                className="leading-none"
                style={{
                  fontFamily: "var(--font-hand)",
                  fontSize: "2.5rem",
                  color: "var(--foreground)",
                  transform: "rotate(-2deg)",
                  letterSpacing: "-0.01em",
                  display: "inline-block",
                }}
              >
                Willson Chen
                <span style={{ color: "var(--red-pen)" }}>.</span>
              </div>
            </div>
            <Doodle
              kind="asterisk"
              size={40}
              color="var(--red-pen)"
              strokeWidth={1.4}
              className="opacity-80"
            />
          </div>
        </div>
      </section>

      <HandDivider className="my-8" />

      {/* Flow */}
      <section className="mt-8 mb-10">
        <div className="mb-5 flex items-center gap-4 flex-wrap">
          <WashiTape color="mint" width="140px" rotate={-1.5} label="你可以这样" />
          
        </div>

        <ol className="space-y-4">
          {flow.map((step, i) => (
            <li key={i} className="flex items-baseline gap-5">
              <div
                className="serif italic leading-none shrink-0"
                style={{
                  fontFamily: "var(--font-hand)",
                  fontSize: "3rem",
                  color: "var(--red-pen)",
                  transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                  width: "3rem",
                }}
              >
                {i + 1}.
              </div>
              <p className="text-lg leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <ContactBlock />
    </div>
  );
}
