import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { isBlockedAddress } from "./address";
import { ExtractionError } from "./errors";

export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

export type FetchedPage = { html: string; finalUrl: string };

/** http·https만 허용하고, 호스트가 내부망·loopback·link-local이면 거절한다. */
export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ExtractionError("invalid_url", "올바른 URL 형식이 아닙니다.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ExtractionError("invalid_url", "http 또는 https 주소만 사용할 수 있습니다.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new ExtractionError("blocked_address", "내부 주소는 가져올 수 없습니다.");
  }
  const addresses = isIP(host)
    ? [host]
    : await lookup(host, { all: true }).then(
        (r) => r.map((a) => a.address),
        () => {
          throw new ExtractionError("fetch_failed", "주소를 찾을 수 없습니다.");
        },
      );
  if (addresses.some(isBlockedAddress)) {
    throw new ExtractionError("blocked_address", "내부 주소는 가져올 수 없습니다.");
  }
  return url;
}

export async function fetchPage(
  raw: string,
  fetchImpl: typeof fetch = fetch,
): Promise<FetchedPage> {
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  let url = await assertPublicHttpUrl(raw);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response;
    try {
      res = await fetchImpl(url, {
        redirect: "manual",
        signal,
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "Mozilla/5.0 (compatible; FeedmeBot/1.0)",
        },
      });
    } catch {
      throw new ExtractionError(
        "fetch_failed",
        "페이지를 가져오지 못했습니다(시간 초과 또는 연결 실패).",
      );
    }

    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = await assertPublicHttpUrl(new URL(location, url).href);
      continue;
    }
    if (!res.ok) {
      throw new ExtractionError("fetch_failed", `페이지가 ${res.status} 응답을 보냈습니다.`);
    }
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(type)) {
      throw new ExtractionError("not_html", "HTML 페이지가 아닙니다.");
    }
    const html = await readCapped(res, signal);
    return { html, finalUrl: url.href };
  }
  throw new ExtractionError("fetch_failed", "리디렉션이 너무 많습니다.");
}

async function readCapped(res: Response, signal: AbortSignal): Promise<string> {
  const tooBig = () => new ExtractionError("fetch_failed", "페이지가 너무 큽니다(5MB 초과).");
  if (Number(res.headers.get("content-length")) > MAX_BODY_BYTES) throw tooBig();
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw tooBig();
      }
      chunks.push(value);
    }
  } catch (e) {
    if (e instanceof ExtractionError) throw e;
    throw new ExtractionError(
      "fetch_failed",
      signal.aborted ? "페이지를 가져오는 시간이 초과되었습니다." : "페이지를 읽지 못했습니다.",
    );
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
