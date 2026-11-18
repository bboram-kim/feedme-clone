export type ExtractionErrorCode =
  | "invalid_url"
  | "blocked_address"
  | "fetch_failed"
  | "not_html"
  | "empty_content";

export class ExtractionError extends Error {
  constructor(
    readonly code: ExtractionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}
