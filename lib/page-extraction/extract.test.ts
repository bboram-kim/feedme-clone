// @vitest-environment node
import { expect, test } from "vitest";

import { extractMarkdown } from "./extract";

const html = `<!doctype html><html><head><title>Use the saw</title>
<meta name="author" content="Steph Ango"></head>
<body><nav>menu</nav><article><h1>Use the saw</h1>
<p>Powerful tools can do powerful things. Fear the saw and respect the craft of making things by hand.</p>
<p>Second paragraph with <strong>bold</strong> text to make the article long enough to be recognized.</p>
</article></body></html>`;

test("defuddle로 제목·저자·Markdown 본문을 추출한다", async () => {
  const page = await extractMarkdown(html, "https://example.com/saw");
  expect(page.title).toBe("Use the saw");
  expect(page.author).toBe("Steph Ango");
  expect(page.site).toBe("example.com");
  expect(page.markdown).toContain("Powerful tools");
  expect(page.markdown).toContain("**bold**");
});
