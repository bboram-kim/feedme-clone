"use client";

import { BookmarkCheckIcon, BookmarkIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import type { ExtractedPage } from "@/lib/page-extraction";
import { saveArticle } from "@/lib/saved-articles";
import { createClient } from "@/lib/supabase/client";

/** 변환 결과 저장. 로그인 여부는 클라이언트에서 확인하고, 접근 제어는 DB의 RLS가 맡습니다. */
export function SaveButton({ url, page }: { url: string; page: ExtractedPage }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    let active = true;
    createClient()
      .auth.getClaims()
      .then(({ data }) => {
        if (active) setUserId(data?.claims?.sub ?? null);
      })
      .catch(() => {
        if (active) setUserId(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (userId === undefined) {
    return (
      <Button variant="outline" disabled>
        <BookmarkIcon data-icon="inline-start" />
        저장
      </Button>
    );
  }

  if (userId === null) {
    return (
      <Link href="/auth/login?next=/" className={buttonVariants({ variant: "outline" })}>
        <BookmarkIcon data-icon="inline-start" />
        로그인하고 저장
      </Link>
    );
  }

  async function save() {
    if (state !== "idle" || !userId) return;
    setState("saving");
    try {
      await saveArticle(createClient(), userId, url, page);
      setState("saved");
      toast.success("저장한 글에 담았어요");
    } catch {
      setState("idle");
      toast.error("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <Button variant="outline" onClick={save} disabled={state !== "idle"}>
      {state === "saving" ? (
        <Loader2Icon className="animate-spin" data-icon="inline-start" />
      ) : state === "saved" ? (
        <BookmarkCheckIcon data-icon="inline-start" />
      ) : (
        <BookmarkIcon data-icon="inline-start" />
      )}
      {state === "saved" ? "저장됨" : state === "saving" ? "저장 중" : "저장"}
    </Button>
  );
}
