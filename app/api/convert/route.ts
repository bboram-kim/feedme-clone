import { convertUrl, ExtractionError, type ExtractionErrorCode } from "@/lib/page-extraction";

const STATUS: Record<ExtractionErrorCode, number> = {
  invalid_url: 400,
  blocked_address: 403,
  fetch_failed: 502,
  not_html: 415,
  empty_content: 422,
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url : "";
  try {
    return Response.json(await convertUrl(url));
  } catch (e) {
    if (e instanceof ExtractionError) {
      return Response.json(
        { error: { code: e.code, message: e.message } },
        { status: STATUS[e.code] },
      );
    }
    return Response.json(
      { error: { code: "fetch_failed", message: "변환 중 오류가 발생했습니다." } },
      { status: 500 },
    );
  }
}
