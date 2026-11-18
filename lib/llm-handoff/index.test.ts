import { describe, expect, test } from "vitest";

import { buildMessage, markdownFilename, MAX_CHAT_URL_LENGTH, planChatHandoff } from ".";

describe("buildMessage", () => {
  test("프롬프트 + 빈 줄 + 본문 순서", () => {
    expect(buildMessage("요약해줘", "# 본문")).toBe("요약해줘\n\n# 본문");
  });
  test("프롬프트가 없거나 공백이면 본문만", () => {
    expect(buildMessage(null, "# 본문")).toBe("# 본문");
    expect(buildMessage("  ", "# 본문")).toBe("# 본문");
  });
});

describe("planChatHandoff", () => {
  test("짧으면 ?q= 로 채워 연다", () => {
    const plan = planChatHandoff("chatgpt", "요약해줘\n\nhi");
    expect(plan).toEqual({
      kind: "prefilled",
      url: `https://chatgpt.com/?q=${encodeURIComponent("요약해줘\n\nhi")}`,
    });
    const claude = planChatHandoff("claude", "hi");
    expect(claude.url).toBe("https://claude.ai/new?q=hi");
  });

  test("길면 전체 텍스트를 클립보드로 넘기고 빈 새 채팅을 연다", () => {
    const long = "a".repeat(MAX_CHAT_URL_LENGTH);
    const plan = planChatHandoff("claude", long);
    expect(plan).toEqual({ kind: "clipboard", url: "https://claude.ai/new", text: long });
  });

  test("경계: URL 길이가 한도 이하면 채워 연다", () => {
    const base = "https://chatgpt.com/?q=".length;
    const fits = planChatHandoff("chatgpt", "a".repeat(MAX_CHAT_URL_LENGTH - base));
    expect(fits.kind).toBe("prefilled");
    const over = planChatHandoff("chatgpt", "a".repeat(MAX_CHAT_URL_LENGTH - base + 1));
    expect(over.kind).toBe("clipboard");
  });
});

describe("markdownFilename", () => {
  test("제목에서 파일명을 만든다", () => {
    expect(markdownFilename("Use the saw, fear the saw", "stephango.com")).toBe(
      "use-the-saw-fear-the-saw.md",
    );
  });
  test("한글 제목도 유지한다", () => {
    expect(markdownFilename("웹 페이지: 제목!", "x.com")).toBe("웹-페이지-제목.md");
  });
  test("제목이 없으면 도메인", () => {
    expect(markdownFilename("", "example.com")).toBe("example.com.md");
  });
});
