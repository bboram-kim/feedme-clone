"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteSavedArticle } from "@/lib/saved-articles";
import { createClient } from "@/lib/supabase/client";

export function DeleteButton({
  id,
  title,
  redirectTo,
}: {
  id: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await deleteSavedArticle(createClient(), id);
      setOpen(false);
      toast.success("저장한 글을 삭제했어요");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`${title} 삭제`} title="삭제" />}
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>저장한 글을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            “{title}” 글을 삭제하면 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>취소</AlertDialogCancel>
          <Button variant="destructive" onClick={remove} disabled={busy}>
            {busy && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
            삭제
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
