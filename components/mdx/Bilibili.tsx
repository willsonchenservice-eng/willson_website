export default function Bilibili({ bvid }: { bvid: string }) {
  if (!bvid) return null;

  let src: string;
  if (bvid.startsWith("ep")) {
    // 处理 ep 链接
    const epId = bvid.replace("ep", "");
    src = `//player.bilibili.com/player.html?ep_id=${epId}&page=1&high_quality=1&danmaku=0`;
  } else {
    // 处理普通 BV 链接
    src = `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
  }

  return (
    <div
      className="my-6 w-full relative bg-line rounded-xl overflow-hidden shadow-[0_12px_28px_-12px_rgba(0,0,0,0.1)]"
      style={{ paddingBottom: "56.25%" }}
    >
      <iframe
        src={src}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}
