import { ServerErrorEventDetail, UiEvent } from "../interfaces/ui-events";

import { publish } from "./custom-events";

interface ResponseContextLike {
  url: string;
  init: RequestInit;
  response: Response;
}

interface ErrorContextLike {
  url: string;
  init: RequestInit;
  error: unknown;
  response?: Response;
}

interface ServerErrorMiddleware {
  post(context: ResponseContextLike): Promise<Response | void>;
  onError(context: ErrorContextLike): Promise<Response | void>;
}

const GLOBAL_SERVER_ERROR_MARKER = Symbol.for("saltbox.global-server-error");

export function markGlobalServerError<E extends object>(error: E): E {
  (error as Record<symbol, unknown>)[GLOBAL_SERVER_ERROR_MARKER] = true;
  return error;
}

export function isGlobalServerError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ((error as Record<symbol, unknown>)[GLOBAL_SERVER_ERROR_MARKER]) return true;

  const name = (error as { name?: string }).name;
  if (name === "ResponseError") {
    const status = (error as { response?: Response }).response?.status;
    return typeof status === "number" && status >= 500 && status < 600;
  }
  if (name === "FetchError") return true;

  return false;
}

const MAX_BODY_LENGTH = 4000;

function truncate(value: string): string {
  if (value.length <= MAX_BODY_LENGTH) return value;
  return `${value.slice(0, MAX_BODY_LENGTH)}… [truncated]`;
}

async function readResponseBody(response: Response): Promise<string | undefined> {
  try {
    const cloned = response.clone();
    const text = await cloned.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function extractMessage(responseBody: string | undefined): string | undefined {
  if (!responseBody) return undefined;
  try {
    const parsed = JSON.parse(responseBody);
    const candidate = parsed?.message ?? parsed?.detail ?? parsed?.error ?? parsed?.title;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  } catch {
    if (responseBody.trim()) return responseBody;
  }
  return undefined;
}

function serializeRequestBody(body: BodyInit | null | undefined): string | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string") return truncate(body);
  if (body instanceof URLSearchParams) return truncate(body.toString());
  if (body instanceof FormData) {
    const entries: string[] = [];
    body.forEach((value, key) => {
      entries.push(`${key}=${typeof value === "string" ? value : "[file]"}`);
    });
    return truncate(entries.join("&"));
  }
  if (body instanceof Blob) return `[Blob ${body.size} bytes, ${body.type || "unknown"}]`;
  if (body instanceof ArrayBuffer) return `[ArrayBuffer ${body.byteLength} bytes]`;
  return "[binary body]";
}

function describeError(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    const name = error.name && error.name !== "Error" ? `${error.name}: ` : "";
    return `${name}${error.message}`;
  }
  if (typeof error === "string" && error.trim()) return error;
  return undefined;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    ((error as { name?: string }).name === "AbortError" || (error as { code?: number }).code === 20)
  );
}

export function createServerErrorMiddleware(): ServerErrorMiddleware {
  return {
    async post({ url, init, response }) {
      if (response && response.status >= 500 && response.status < 600) {
        const responseBody = await readResponseBody(response);
        publish<ServerErrorEventDetail>(UiEvent.ServerError, {
          status: response.status,
          statusText: response.statusText || "",
          message: extractMessage(responseBody),
          url,
          method: (init?.method || "GET").toUpperCase(),
          requestBody: serializeRequestBody(init?.body),
          responseBody: responseBody ? truncate(responseBody) : undefined,
          timestamp: new Date().toISOString(),
        });
      }
      return response;
    },
    async onError({ url, init, error }) {
      if (isAbortError(error)) return undefined;
      publish<ServerErrorEventDetail>(UiEvent.ServerError, {
        status: 0,
        statusText: "Network Error",
        message: describeError(error),
        url,
        method: (init?.method || "GET").toUpperCase(),
        requestBody: serializeRequestBody(init?.body),
        timestamp: new Date().toISOString(),
      });
    },
  };
}
