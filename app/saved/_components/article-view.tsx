"use client";

import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

import { ExportMenu } from "@/app/_components/export-menu";
import { MarkdownView } from "@/app/_components/markdown-view";
import { PromptPicker, type PromptChoice } from "@/app/_components/prompt-picker";
import { useHandoff } from "@/app/_components/use-handoff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayTitle, formatSavedDate, type SavedArticle } from "@/lib/saved-articles";

import { DeleteButton } from "./delete-button";

export function ArticleView({ article }: { article: SavedArticle }) {
  const [choice, setChoice] = useState<PromptChoice>(null);
  const [custom, setCustom] = useState("");
  const { copy, download, openChat } = useHandoff(article, choice, custom);
  const title = displayTitle(article);

  return (
    <div className="flex flex-col gap-5">
      <PromptPicker
        choice={choice}
        custom={custom}
        onChoiceChange={setChoice}
        onCustomChange={setCustom}
      />
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-end gap-2">
          <DeleteButton id={article.id} title={title} redirectTo="/saved" />
          <ExportMenu onCopy={copy} onDownload={download} onOpenChat={openChat} />
        </div>
        <Card>
          <CardHeader className="gap-1 border-b">
            <CardTitle className="text-xl leading-snug text-balance">{title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {[article.author, article.site].filter(Boolean).join(" · ")} ·{" "}
              {formatSavedDate(article.savedAt)} 저장
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm break-all text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <ExternalLinkIcon className="size-3.5 shrink-0" />
              원본 링크
            </a>
          </CardHeader>
          <CardContent>
            <MarkdownView markdown={article.markdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
