import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <article
      className={[
        "text-[15px] leading-7 wrap-anywhere",
        "[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold",
        "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold",
        "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold",
        "[&_p]:mb-3.5",
        "[&_a]:underline [&_a]:underline-offset-4",
        "[&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_blockquote]:mb-3.5 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
        "[&_pre]:mb-3.5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md",
        "[&_table]:mb-3.5 [&_table]:block [&_table]:overflow-x-auto [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        "[&_hr]:my-5 [&_hr]:border-border",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
