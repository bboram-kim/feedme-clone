export const MAX_CHAT_URL_LENGTH = 8000;

export type ChatProvider = "chatgpt" | "claude";

const CHAT_ENDPOINTS: Record<ChatProvider, string> = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
};

/** 프롬프트가 있으면 `프롬프트 + 빈 줄 + 본문`, 없으면 본문만. */
export function buildMessage(prompt: string | null, markdown: string): string {
  const p = prompt?.trim();
  return p ? `${p}\n\n${markdown}` : markdown;
}

export type ChatHandoff =
  | { kind: "prefilled"; url: string }
  | { kind: "clipboard"; url: string; text: string };

/** 쿼리에 담기는 길이면 `?q=`로 채워 열고, 길면 클립보드 복사 + 빈 새 채팅으로 대체한다. */
export function planChatHandoff(provider: ChatProvider, message: string): ChatHandoff {
  const base = CHAT_ENDPOINTS[provider];
  const url = `${base}?q=${encodeURIComponent(message)}`;
  if (url.length <= MAX_CHAT_URL_LENGTH) return { kind: "prefilled", url };
  return { kind: "clipboard", url: base, text: message };
}

/** 페이지 제목에서 파일명을 만든다. 제목이 없으면 도메인을 쓴다. */
export function markdownFilename(title: string, site: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return `${slug || site.replace(/[^a-z0-9.-]/gi, "-") || "page"}.md`;
}
