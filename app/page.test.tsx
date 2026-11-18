import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import Home from "@/app/page";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn(), theme: "light" }),
}));

const supabaseMock = vi.hoisted(() => ({
  claims: null as { sub: string } | null,
  upsert: vi.fn(async (_row: unknown, _opts: unknown) => ({ error: null as { message: string } | null })),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getClaims: async () => ({ data: { claims: supabaseMock.claims } }) },
    from: () => ({ upsert: supabaseMock.upsert }),
  }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  supabaseMock.claims = null;
  supabaseMock.upsert.mockClear();
});

const page = {
  title: "Use the saw, fear the saw",
  author: "Steph Ango",
  site: "stephango.com",
  markdown: "Fear the saw.\n\n- one\n- two",
};

function mockApi(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn(async () => ({ ok: response.ok, json: async () => response.body }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

test("홈 화면은 앱 타이틀과 화면 제목, 입력칸을 보여준다", () => {
  render(<Home />);
  expect(screen.getByText("Feedme")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "웹페이지를 Markdown으로" })).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 URL")).toBeInTheDocument();
  expect(screen.queryByText("복사하기")).not.toBeInTheDocument();
});

test("변환하면 제목·저자·본문이 보이고, 지우기로 모두 초기화된다", async () => {
  const user = userEvent.setup();
  mockApi({ ok: true, body: page });
  render(<Home />);

  await user.type(screen.getByLabelText("웹 페이지 URL"), "https://stephango.com/saw");
  await user.click(screen.getByRole("button", { name: "변환" }));

  expect(await screen.findByText("Use the saw, fear the saw")).toBeInTheDocument();
  expect(screen.getByText("Steph Ango · stephango.com")).toBeInTheDocument();
  expect(screen.getByText("one")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "복사하기" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "지우기" }));
  expect(screen.getByLabelText("웹 페이지 URL")).toHaveValue("");
  expect(screen.queryByText("Use the saw, fear the saw")).not.toBeInTheDocument();
  expect(screen.queryByText("복사하기")).not.toBeInTheDocument();
});

test("직접 입력을 고르기 전에는 입력칸이 없고, 고르면 나타난다", async () => {
  const user = userEvent.setup();
  render(<Home />);
  expect(screen.queryByLabelText("직접 입력 프롬프트")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "직접 입력" }));
  expect(screen.getByLabelText("직접 입력 프롬프트")).toBeInTheDocument();
});

test("URL 형식 오류는 요청 없이 안내하고 입력을 유지한다", async () => {
  const user = userEvent.setup();
  const fetchMock = mockApi({ ok: true, body: page });
  render(<Home />);
  await user.type(screen.getByLabelText("웹 페이지 URL"), "ftp://example.com");
  await user.click(screen.getByRole("button", { name: "변환" }));
  expect(screen.getByText("올바른 주소가 아니에요")).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 URL")).toHaveValue("ftp://example.com");
  expect(fetchMock).not.toHaveBeenCalled();
});

test.each([
  ["blocked_address", "가져올 수 없는 주소예요"],
  ["fetch_failed", "페이지를 가져오지 못했어요"],
  ["not_html", "HTML 페이지가 아니에요"],
  ["empty_content", "본문을 찾지 못했어요"],
])("서버 오류 %s 는 구분된 메시지로 보인다", async (code, title) => {
  const user = userEvent.setup();
  mockApi({ ok: false, body: { error: { code, message: "x" } } });
  render(<Home />);
  await user.type(screen.getByLabelText("웹 페이지 URL"), "https://example.com");
  await user.click(screen.getByRole("button", { name: "변환" }));
  expect(await screen.findByText(title)).toBeInTheDocument();
  expect(screen.getByLabelText("웹 페이지 URL")).toHaveValue("https://example.com");
  await waitFor(() => expect(screen.getByRole("button", { name: "변환" })).toBeEnabled());
});

async function convertArticle(user: ReturnType<typeof userEvent.setup>) {
  mockApi({ ok: true, body: page });
  render(<Home />);
  await user.type(screen.getByLabelText("웹 페이지 URL"), "https://stephango.com/saw");
  await user.click(screen.getByRole("button", { name: "변환" }));
  await screen.findByText("Use the saw, fear the saw");
}

test("로그인한 사용자가 저장하면 저장됨 상태로 바뀌고 스냅샷이 저장된다", async () => {
  const user = userEvent.setup();
  supabaseMock.claims = { sub: "user-1" };
  await convertArticle(user);

  await user.click(await screen.findByRole("button", { name: "저장" }));

  expect(await screen.findByRole("button", { name: "저장됨" })).toBeDisabled();
  expect(supabaseMock.upsert).toHaveBeenCalledTimes(1);
  expect(supabaseMock.upsert.mock.calls[0][0]).toMatchObject({
    user_id: "user-1",
    url: "https://stephango.com/saw",
    title: "Use the saw, fear the saw",
    markdown: page.markdown,
  });
});

test("저장에 실패하면 저장됨으로 바뀌지 않고 다시 저장할 수 있다", async () => {
  const user = userEvent.setup();
  supabaseMock.claims = { sub: "user-1" };
  supabaseMock.upsert.mockResolvedValueOnce({ error: { message: "boom" } });
  await convertArticle(user);

  await user.click(await screen.findByRole("button", { name: "저장" }));

  await waitFor(() => expect(screen.getByRole("button", { name: "저장" })).toBeEnabled());
  expect(screen.queryByRole("button", { name: "저장됨" })).not.toBeInTheDocument();
});

test("비로그인 사용자에게는 로그인하고 저장 링크가 보이고, 변환 기능은 그대로 쓴다", async () => {
  const user = userEvent.setup();
  await convertArticle(user);

  const link = await screen.findByRole("link", { name: "로그인하고 저장" });
  expect(link).toHaveAttribute("href", "/auth/login?next=/");
  expect(screen.getByRole("button", { name: "복사하기" })).toBeInTheDocument();
  expect(supabaseMock.upsert).not.toHaveBeenCalled();
});

test("홈 상단에서 저장한 글로 이동할 수 있다", () => {
  render(<Home />);
  expect(screen.getByRole("link", { name: "저장한 글" })).toHaveAttribute("href", "/saved");
});
