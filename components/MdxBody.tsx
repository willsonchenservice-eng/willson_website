import { MDXRemote } from "next-mdx-remote/rsc";
import Bilibili from "@/components/mdx/Bilibili";
import AutoLink from "@/components/mdx/AutoLink";

const mdxComponents = {
  Bilibili,
  a: AutoLink,
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
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
