import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSavedArticle } from "@/lib/saved-articles";
import { createClient } from "@/lib/supabase/server";

import { ArticleView } from "../_components/article-view";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SavedArticlePage({ params }: PageProps<"/saved/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect(`/auth/login?next=/saved/${encodeURIComponent(id)}`);
  }

  // RLS가 본인 글만 돌려주므로, 남의 글과 없는 글은 똑같이 찾을 수 없음으로 처리합니다.
  const article = UUID.test(id) ? await getSavedArticle(supabase, id) : null;
  if (!article) notFound();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <div>
          <Link href="/saved" className="text-sm text-muted-foreground hover:text-foreground">
            ← 저장한 글
          </Link>
        </div>
        <ArticleView article={article} />
      </div>
    </main>
  );
}
