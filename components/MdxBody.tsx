import { MDXRemote } from "next-mdx-remote/rsc";
import Bilibili from "@/components/mdx/Bilibili";
import AutoLink from "@/components/mdx/AutoLink";
import MdxImage from "@/components/mdx/MdxImage";
import { normalizeMdxSource } from "@/lib/mdx";

const mdxComponents = {
  Bilibili,
  a: AutoLink,
  img: MdxImage,
};

export default function MdxBody({
  source,
  className = "prose-mdx",
}: {
  source: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <MDXRemote source={normalizeMdxSource(source)} components={mdxComponents} />
    </div>
  );
}
