"use client";

import { ChevronDownIcon, CopyIcon, DownloadIcon, MessageSquareIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatProvider } from "@/lib/llm-handoff";

export function ExportMenu({
  onCopy,
  onDownload,
  onOpenChat,
}: {
  onCopy: () => void;
  onDownload: () => void;
  onOpenChat: (provider: ChatProvider) => void;
}) {
  return (
    <ButtonGroup>
      <Button variant="outline" onClick={onCopy}>
        <CopyIcon data-icon="inline-start" />
        복사하기
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="더 보기" />}>
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onClick={onDownload}>
            <DownloadIcon />
            마크다운 다운로드
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenChat("chatgpt")}>
            <MessageSquareIcon />
            ChatGPT에서 열기
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenChat("claude")}>
            <SparklesIcon />
            Claude에서 열기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
