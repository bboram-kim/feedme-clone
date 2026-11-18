import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExtractedPage } from "@/lib/page-extraction";

export type SavedArticle = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  site: string;
  markdown: string;
  savedAt: string;
};

const COLUMNS = "id, url, title, author, site, markdown, saved_at";

type Row = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  site: string;
  markdown: string;
  saved_at: string;
};

function toArticle(row: Row): SavedArticle {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    author: row.author,
    site: row.site,
    markdown: row.markdown,
    savedAt: row.saved_at,
  };
}

/** 같은 사용자·같은 URL이면 새 항목 대신 기존 항목의 스냅샷과 저장 시각을 갱신합니다. */
export async function saveArticle(
  supabase: SupabaseClient,
  userId: string,
  url: string,
  page: ExtractedPage,
): Promise<void> {
  const { error } = await supabase.from("saved_articles").upsert(
    {
      user_id: userId,
      url,
      title: page.title || null,
      author: page.author || null,
      site: page.site,
      markdown: page.markdown,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,url" },
  );
  if (error) throw new Error(error.message);
}

export async function listSavedArticles(supabase: SupabaseClient): Promise<SavedArticle[]> {
  const { data, error } = await supabase
    .from("saved_articles")
    .select(COLUMNS)
    .order("saved_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Row[]).map(toArticle);
}

export async function getSavedArticle(
  supabase: SupabaseClient,
  id: string,
): Promise<SavedArticle | null> {
  const { data, error } = await supabase
    .from("saved_articles")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toArticle(data as Row) : null;
}

export async function deleteSavedArticle(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("saved_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** 목록·상세에 쓰는 제목: 제목이 없으면 사이트 이름. */
export function displayTitle(article: Pick<SavedArticle, "title" | "site">): string {
  return article.title?.trim() || article.site;
}

export function formatSavedDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
