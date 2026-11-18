"use client";

import { toast } from "sonner";

import {
  buildMessage,
  markdownFilename,
  planChatHandoff,
  type ChatProvider,
} from "@/lib/llm-handoff";

import { resolvePrompt, type PromptChoice } from "./prompt-picker";

const CHAT_NAMES: Record<ChatProvider, string> = { chatgpt: "ChatGPT", claude: "Claude" };

type HandoffPage = { title: string | null; site: string; markdown: string };

/** 복사·다운로드·ChatGPT/Claude 전달. 변환 화면과 저장한 글 상세가 같이 씁니다. */
export function useHandoff(page: HandoffPage | null, choice: PromptChoice, custom: string) {
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      toast.error("클립보드에 복사하지 못했어요. 브라우저 권한을 확인해 주세요.");
      return false;
    }
  }

  async function copy() {
    if (page && (await copyText(page.markdown))) toast.success("Markdown 본문을 복사했어요");
  }

  function download() {
    if (!page) return;
    const blob = new Blob([page.markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = markdownFilename(page.title ?? "", page.site);
    a.click();
    URL.revokeObjectURL(href);
    toast.success(`${a.download} 파일을 저장했어요`);
  }

  async function openChat(provider: ChatProvider) {
    if (!page) return;
    const prompt = resolvePrompt(choice, custom);
    const plan = planChatHandoff(provider, buildMessage(prompt, page.markdown));
    const name = CHAT_NAMES[provider];
    if (plan.kind === "clipboard") {
      if (!(await copyText(plan.text))) return;
      window.open(plan.url, "_blank", "noopener,noreferrer");
      toast.info(
        `본문이 길어 ${prompt ? "프롬프트와 함께 " : ""}클립보드에 복사했어요. ${name} 새 채팅에 붙여넣어 주세요.`,
        { duration: 8000 },
      );
      return;
    }
    window.open(plan.url, "_blank", "noopener,noreferrer");
    toast.success(`${prompt ? `“${prompt}” 프롬프트와 함께 ` : ""}${name} 새 채팅을 열었어요`);
  }

  return { copy, download, openChat };
}
