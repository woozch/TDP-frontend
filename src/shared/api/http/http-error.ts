export class HttpError extends Error {
  readonly name = "HttpError";
  readonly status: number;
  readonly url: string;
  readonly detail: string;

  constructor(params: { status: number; url: string; detail?: string; message?: string }) {
    const message =
      params.message ??
      `Request failed (${params.status}${params.detail ? `: ${params.detail}` : ""})`;
    super(message);
    this.status = params.status;
    this.url = params.url;
    this.detail = params.detail ?? "";
  }
}

