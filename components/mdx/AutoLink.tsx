import Link from "next/link";

export default async function AutoLink(props: any) {
  const href = props.href;

  // 直接渲染原始链接，不做任何 B 站嵌入处理
  const isInternal = href && href.startsWith("/");
  if (isInternal) {
    return <Link href={href} {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}
