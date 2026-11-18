import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import Home from "@/app/page";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn(), theme: "light" }),
}));

afterEach(() => vi.unstubAllGlobals());

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
