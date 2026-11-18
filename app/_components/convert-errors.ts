import type { ExtractionErrorCode } from "@/lib/page-extraction";

export type ConvertError = { code: ExtractionErrorCode; detail?: string };

const MESSAGES: Record<ExtractionErrorCode, { title: string; description: string }> = {
  invalid_url: {
    title: "올바른 주소가 아니에요",
    description: "http:// 또는 https://로 시작하는 주소를 입력해 주세요.",
  },
  blocked_address: {
    title: "가져올 수 없는 주소예요",
    description: "내부망·loopback 주소는 변환할 수 없어요. 공개된 웹 페이지 주소를 입력해 주세요.",
  },
  fetch_failed: {
    title: "페이지를 가져오지 못했어요",
    description: "응답이 10초 안에 오지 않았거나 접근이 거절됐어요. 잠시 후 다시 시도해 주세요.",
  },
  not_html: {
    title: "HTML 페이지가 아니에요",
    description: "이미지·PDF·JSON 같은 파일은 변환할 수 없어요. 웹 페이지 주소를 입력해 주세요.",
  },
  empty_content: {
    title: "본문을 찾지 못했어요",
    description: "추출된 내용이 비어 있어요. 자바스크립트로 본문을 그리는 페이지일 수 있어요.",
  },
};

export function describeError(error: ConvertError) {
  const base = MESSAGES[error.code];
  return {
    title: base.title,
    description: error.detail ? `${base.description} (${error.detail})` : base.description,
  };
}
