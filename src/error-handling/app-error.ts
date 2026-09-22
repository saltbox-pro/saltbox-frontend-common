export type AppErrorKind =
  | "network"
  | "unavailable"
  | "server"
  | "not_found"
  | "forbidden"
  | "unauthorized"
  | "conflict"
  | "validation"
  | "generic";

export interface AppErrorValidationItem {
  loc?: (string | number)[];
  msg: string;
}

/**
 * Транспортная диагностика ответа для раскрывашки деталей и копирования в тикет.
 * Собирается прямо из Response — отдельный transport-middleware для этого не нужен.
 */
export interface ErrorDiagnostics {
  url: string;
  status: number;
  statusText: string;
  responseBody?: string;
  timestamp: string;
}

const MAX_BODY_LENGTH = 4000;

export interface AppError {
  /** HTTP-статус ответа; 0 — сетевая ошибка / ошибка вне HTTP */
  status: number;
  kind: AppErrorKind;
  /** Сообщение, извлечённое из тела ответа бекенда */
  serverMessage?: string;
  /** Элементы FastAPI detail[] для 422 — маппинг на поля формы */
  validationItems?: AppErrorValidationItem[];
  /** Диагностика транспорта (url, статус, тело ответа) — для раскрывашки деталей и копирования */
  diagnostics?: ErrorDiagnostics;
  /** Исходная ошибка для отладки и телеметрии */
  raw: unknown;
}

/** Текст для кнопки «скопировать детали»: единый формат на весь продукт. */
export function buildErrorDebugText(error: AppError): string {
  const d = error.diagnostics;
  const lines = [
    d?.timestamp ? `Time: ${d.timestamp}` : null,
    `Status: ${error.status}${d?.statusText ? ` ${d.statusText}` : ""} (${error.kind})`,
    d?.url ? `URL: ${d.url}` : null,
    error.serverMessage ? `Message: ${error.serverMessage}` : null,
    d?.responseBody ? `Response body:\n${d.responseBody}` : null,
    typeof navigator !== "undefined" ? `User-Agent: ${navigator.userAgent}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

export function mapStatusToKind(status: number): AppErrorKind {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    case 502:
    case 503:
    case 504:
      return "unavailable";
  }
  if (status >= 500 && status < 600) return "server";
  return "generic";
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || (error as { code?: number }).code === 20)
  );
}

export function isNetworkTypeError(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("network request failed")
  );
}

/**
 * Единственная точка нормализации ошибок API: статус, тело ответа, диагностика.
 * Асинхронна, потому что тело ResponseError — непрочитанный стрим (typescript-fetch).
 */
export async function normalizeApiError(error: unknown): Promise<AppError> {
  const name = getErrorName(error);

  if (name === "ResponseError") {
    const response = (error as { response?: Response }).response;
    if (response && typeof response.status === "number") {
      const body = await extractBodyInfo(response);
      return {
        status: response.status,
        kind: mapStatusToKind(response.status),
        serverMessage: body.serverMessage,
        validationItems: body.validationItems,
        diagnostics: {
          url: response.url,
          status: response.status,
          statusText: response.statusText || "",
          responseBody: body.rawBody,
          timestamp: new Date().toISOString(),
        },
        raw: error,
      };
    }
  }

  if (name === "FetchError") {
    return { status: 0, kind: "network", raw: error };
  }

  if (isNetworkTypeError(error)) {
    return { status: 0, kind: "network", raw: error };
  }

  return {
    status: 0,
    kind: "generic",
    serverMessage: error instanceof Error && error.message ? error.message : undefined,
    raw: error,
  };
}

function getErrorName(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  return (error as { name?: string }).name;
}

interface BodyInfo {
  serverMessage?: string;
  validationItems?: AppErrorValidationItem[];
  /** Сырое тело для debug-деталей (обрезанное) */
  rawBody?: string;
}

/**
 * Приоритет полей тела: detail (строка) → detail[] (msg через "; ") →
 * message → error → title.
 */
async function extractBodyInfo(response: Response): Promise<BodyInfo> {
  let text: string;
  try {
    text = await response.clone().text();
  } catch {
    return {};
  }
  if (!text) return {};

  const rawBody = text.length > MAX_BODY_LENGTH ? `${text.slice(0, MAX_BODY_LENGTH)}…` : text;

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { rawBody };
  }
  if (!body || typeof body !== "object") return { rawBody };

  const { detail, message, error, title } = body as Record<string, unknown>;

  if (typeof detail === "string" && detail) return { serverMessage: detail, rawBody };

  if (Array.isArray(detail)) {
    const items = detail.filter(
      (item): item is AppErrorValidationItem =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as { msg?: unknown }).msg === "string"
    );
    if (items.length) {
      return {
        serverMessage: items.map((item) => item.msg).join("; "),
        validationItems: items.map((item) => ({ loc: item.loc, msg: item.msg })),
        rawBody,
      };
    }
  }

  for (const candidate of [message, error, title]) {
    if (typeof candidate === "string" && candidate) return { serverMessage: candidate, rawBody };
  }
  return { rawBody };
}
