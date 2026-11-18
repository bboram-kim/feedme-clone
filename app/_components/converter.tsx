"use client";

import { Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildMessage,
  markdownFilename,
  planChatHandoff,
  type ChatProvider,
} from "@/lib/llm-handoff";
import type { ExtractedPage } from "@/lib/page-extraction";

import { describeError, type ConvertError } from "./convert-errors";
import { ExportMenu } from "./export-menu";
import { MarkdownView } from "./markdown-view";
import { PromptPicker, resolvePrompt, type PromptChoice } from "./prompt-picker";

const CHAT_NAMES: Record<ChatProvider, string> = { chatgpt: "ChatGPT", claude: "Claude" };

export function Converter() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [page, setPage] = useState<ExtractedPage | null>(null);
  const [error, setError] = useState<ConvertError | null>(null);
  const [choice, setChoice] = useState<PromptChoice>(null);
  const [custom, setCustom] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const loading = status === "loading";

  async function convert() {
    if (loading) return;
    const value = url.trim();
    if (!/^https?:\/\/\S+$/i.test(value)) {
      setPage(null);
      setError({ code: "invalid_url" });
      setStatus("error");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    setError(null);
    setPage(null);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        const code = data?.error?.code ?? "fetch_failed";
        setError({ code, detail: code === "fetch_failed" ? data?.error?.message : undefined });
        setStatus("error");
        return;
      }
      setPage(data as ExtractedPage);
      setStatus("done");
    } catch {
      if (controller.signal.aborted) return;
      setError({ code: "fetch_failed", detail: "서버에 연결하지 못했습니다." });
      setStatus("error");
    }
  }

  function clearAll() {
    abortRef.current?.abort();
    setUrl("");
    setPage(null);
    setError(null);
    setStatus("idle");
    setChoice(null);
    setCustom("");
  }

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
    a.download = markdownFilename(page.title, page.site);
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

  const errorText = error ? describeError(error) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void convert();
          }}
        >
          <div className="relative flex-1">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              inputMode="url"
              autoComplete="off"
              aria-label="웹 페이지 URL"
              aria-invalid={status === "error" && error?.code === "invalid_url"}
              className="h-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="지우기"
              title="지우기"
              onClick={clearAll}
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
            >
              <XIcon />
            </Button>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
            {loading ? "변환 중" : "변환"}
          </Button>
        </form>
        {errorText && (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>{errorText.title}</AlertTitle>
            <AlertDescription>{errorText.description}</AlertDescription>
          </Alert>
        )}
      </div>

      <PromptPicker
        choice={choice}
        custom={custom}
        onChoiceChange={setChoice}
        onCustomChange={setCustom}
      />

      {loading && (
        <Card aria-busy="true">
          <CardHeader className="gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-10/12" />
          </CardContent>
        </Card>
      )}

      {status === "done" && page && (
        <div className="flex flex-col gap-2.5">
          <ExportMenu onCopy={copy} onDownload={download} onOpenChat={openChat} />
          <Card>
            <CardHeader className="gap-1 border-b">
              <CardTitle className="text-xl leading-snug text-balance">
                {page.title || page.site}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {[page.author, page.site].filter(Boolean).join(" · ")}
              </div>
            </CardHeader>
            <CardContent>
              <MarkdownView markdown={page.markdown} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
