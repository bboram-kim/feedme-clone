import { expect, test, vi } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import { deleteSavedArticle, displayTitle, formatSavedDate, saveArticle } from "./index";

const page = { title: "", author: "", site: "example.com", markdown: "본문" };

test("저장은 사용자·URL 기준 upsert로 스냅샷을 쓴다 (중복 저장은 갱신)", async () => {
  const upsert = vi.fn(async () => ({ error: null }));
  const supabase = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient;

  await saveArticle(supabase, "u1", "https://example.com/a", page);

  expect(supabase.from).toHaveBeenCalledWith("saved_articles");
  const [row, options] = upsert.mock.calls[0] as unknown as [Record<string, unknown>, unknown];
  expect(options).toEqual({ onConflict: "user_id,url" });
  expect(row).toMatchObject({
    user_id: "u1",
    url: "https://example.com/a",
    title: null,
    author: null,
    site: "example.com",
    markdown: "본문",
  });
  expect(typeof row.saved_at).toBe("string");
});

test("저장 실패는 오류로 던진다", async () => {
  const upsert = vi.fn(async () => ({ error: { message: "boom" } }));
  const supabase = { from: () => ({ upsert }) } as unknown as SupabaseClient;
  await expect(saveArticle(supabase, "u1", "https://x.com", page)).rejects.toThrow("boom");
});

test("삭제는 id로 지운다", async () => {
  const eq = vi.fn(async () => ({ error: null }));
  const supabase = { from: () => ({ delete: () => ({ eq }) }) } as unknown as SupabaseClient;
  await deleteSavedArticle(supabase, "abc");
  expect(eq).toHaveBeenCalledWith("id", "abc");
});

test("제목이 없으면 사이트를 제목으로 보여준다", () => {
  expect(displayTitle({ title: null, site: "example.com" })).toBe("example.com");
  expect(displayTitle({ title: "글", site: "example.com" })).toBe("글");
});

test("저장 날짜는 YYYY.MM.DD", () => {
  expect(formatSavedDate("2026-11-18T05:00:00")).toBe("2026.11.18");
});
