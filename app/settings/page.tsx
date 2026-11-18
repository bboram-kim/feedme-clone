import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./_components/profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  // 서버에서 검증된 claims로만 인증을 판단합니다.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login?next=/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-md flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">설정</h1>
          <LogoutButton />
        </div>
        <p className="text-sm text-muted-foreground">{data.claims.email}</p>
        <ProfileForm userId={data.claims.sub} initialName={profile?.display_name ?? ""} />
      </div>
    </main>
  );
}
