import { describe, expect, test } from "vitest";

import { ExtractionError } from "./errors";
import { assertPublicHttpUrl, fetchPage, MAX_BODY_BYTES } from "./fetch-page";

const code = (p: Promise<unknown>) =>
  p.then(
    () => "ok",
    (e: ExtractionError) => e.code,
  );

describe("assertPublicHttpUrl", () => {
  test("http·https가 아니거나 형식이 틀리면 invalid_url", async () => {
    expect(await code(assertPublicHttpUrl("ftp://example.com"))).toBe("invalid_url");
    expect(await code(assertPublicHttpUrl("file:///etc/passwd"))).toBe("invalid_url");
    expect(await code(assertPublicHttpUrl("stephango"))).toBe("invalid_url");
  });

  test("loopback·내부망 주소는 blocked_address", async () => {
    expect(await code(assertPublicHttpUrl("http://localhost:3000"))).toBe("blocked_address");
    expect(await code(assertPublicHttpUrl("http://127.0.0.1/"))).toBe("blocked_address");
    expect(await code(assertPublicHttpUrl("http://[::1]/"))).toBe("blocked_address");
    expect(await code(assertPublicHttpUrl("http://192.168.0.1/"))).toBe("blocked_address");
    expect(await code(assertPublicHttpUrl("http://169.254.169.254/latest"))).toBe("blocked_address");
  });
});

describe("fetchPage", () => {
  const html = (body: string, init: ResponseInit = {}) =>
    (async () =>
      new Response(body, {
        headers: { "content-type": "text/html" },
        ...init,
      })) as unknown as typeof fetch;

  test("공개 주소의 HTML을 반환한다", async () => {
    const page = await fetchPage("http://8.8.8.8/a", html("<p>hi</p>"));
    expect(page.html).toBe("<p>hi</p>");
  });

  test("4xx/5xx는 fetch_failed", async () => {
    expect(await code(fetchPage("http://8.8.8.8/", html("x", { status: 503 })))).toBe("fetch_failed");
  });

  test("HTML이 아니면 not_html", async () => {
    const f = (async () =>
      new Response("{}", { headers: { "content-type": "application/json" } })) as unknown as typeof fetch;
    expect(await code(fetchPage("http://8.8.8.8/", f))).toBe("not_html");
  });

  test("크기 상한을 넘으면 fetch_failed", async () => {
    expect(await code(fetchPage("http://8.8.8.8/", html("a".repeat(MAX_BODY_BYTES + 1))))).toBe(
      "fetch_failed",
    );
  });

  test("내부 주소로 리디렉션하면 거절한다", async () => {
    const f = (async () =>
      new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/admin" },
      })) as unknown as typeof fetch;
    expect(await code(fetchPage("http://8.8.8.8/", f))).toBe("blocked_address");
  });
});
