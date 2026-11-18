"use client";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type PromptChoice = "summarize" | "translate" | "explain" | "custom" | null;

export const PRESET_PROMPTS = {
  summarize: "요약해줘",
  translate: "한국어로 번역해줘",
  explain: "쉽게 설명해줘",
} as const;

const OPTIONS: { value: Exclude<PromptChoice, null>; label: string }[] = [
  { value: "summarize", label: PRESET_PROMPTS.summarize },
  { value: "translate", label: PRESET_PROMPTS.translate },
  { value: "explain", label: PRESET_PROMPTS.explain },
  { value: "custom", label: "직접 입력" },
];

/** 선택된 프롬프트 문장. 선택 안 함이면 null. 직접 입력은 입력값을 쓴다. */
export function resolvePrompt(choice: PromptChoice, custom: string): string | null {
  if (!choice) return null;
  if (choice === "custom") return custom.trim() || null;
  return PRESET_PROMPTS[choice];
}

export function PromptPicker({
  choice,
  custom,
  onChoiceChange,
  onCustomChange,
}: {
  choice: PromptChoice;
  custom: string;
  onChoiceChange: (choice: PromptChoice) => void;
  onCustomChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-muted-foreground">프롬프트 (선택)</div>
      <ToggleGroup
        variant="outline"
        spacing={2}
        className="flex-wrap"
        aria-label="프롬프트"
        value={choice ? [choice] : []}
        onValueChange={(v) => onChoiceChange((v[0] as PromptChoice | undefined) ?? null)}
      >
        {OPTIONS.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} className="rounded-full px-3">
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {choice === "custom" && (
        <Input
          autoFocus
          value={custom}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="예: 핵심만 세 줄로 정리해줘"
          aria-label="직접 입력 프롬프트"
        />
      )}
    </div>
  );
}
