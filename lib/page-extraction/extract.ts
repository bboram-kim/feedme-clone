import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import { ExtractionError } from "./errors";
import { fetchPage } from "./fetch-page";

export type ExtractedPage = {
  title: string;
  author: string;
  site: string;
  markdown: string;
};

export async function extractMarkdown(html: string, url: string): Promise<ExtractedPage> {
  const { document } = parseHTML(html);
  const r = await Defuddle(document, url, { markdown: true });
  return {
    title: r.title?.trim() ?? "",
    author: r.author?.trim() ?? "",
    site: new URL(url).hostname,
    markdown: (r.content ?? "").trim(),
  };
}

export async function convertUrl(rawUrl: string): Promise<ExtractedPage> {
  const { html, finalUrl } = await fetchPage(rawUrl);
  const page = await extractMarkdown(html, finalUrl);
  if (!page.markdown) {
    throw new ExtractionError("empty_content", "추출된 본문이 비어 있습니다.");
  }
  return page;
}
