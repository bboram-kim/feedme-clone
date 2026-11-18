"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({ userId, initialName }: { userId: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() })
      .eq("id", userId)
      .select("display_name");
    setSaving(false);
    if (error || !data?.length) {
      toast.error("저장하지 못했습니다.");
      return;
    }
    toast.success("저장했습니다.");
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="display-name">표시 이름</Label>
        <Input
          id="display-name"
          value={name}
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
