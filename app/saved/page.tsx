import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { displayTitle, formatSavedDate, listSavedArticles } from "@/lib/saved-articles";
import { createClient } from "@/lib/supabase/server";

import { DeleteButton } from "./_components/delete-button";

export default async function SavedPage() {
  const supabase = await createClient();

  // 서버에서 검증된 claims로만 인증을 판단합니다.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login?next=/saved");
  }

  const articles = await listSavedArticles(supabase);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">저장한 글</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            변환하러 가기
          </Link>
        </div>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <BookmarkIcon className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">아직 저장한 글이 없어요</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  글을 변환한 뒤 저장하면 여기에 모입니다.
                </p>
              </div>
              <Link href="/" className={buttonVariants()}>
                글 변환하러 가기
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {articles.map((article) => {
              const title = displayTitle(article);
              return (
                <li key={article.id}>
                  <Card size="sm">
                    <CardContent className="flex items-center justify-between gap-3">
                      <Link href={`/saved/${article.id}`} className="min-w-0 flex-1">
                        <div className="truncate font-medium">{title}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {[article.author, article.site].filter(Boolean).join(" · ")} ·{" "}
                          {formatSavedDate(article.savedAt)}
                        </div>
                      </Link>
                      <DeleteButton id={article.id} title={title} />
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
