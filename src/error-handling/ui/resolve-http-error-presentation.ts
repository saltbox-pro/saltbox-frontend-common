import type { TFunction } from "i18next";

import type { AppError, AppErrorKind } from "../app-error";

export type HttpErrorPresentation = {
  kind: AppErrorKind;
  resultStatus: "404" | "403" | "500" | "error";
  title: string;
  subtitle: string;
  statusLabel?: string;
  showStatusInTitle: boolean;
  /** «500 · Ошибка сервера» — код плюс его расшифровка; для сетевых ошибок только текст */
  codeLine: string;
};

const TITLE_KEY_BY_KIND: Record<AppErrorKind, string> = {
  not_found: "errors.page.not-found-title",
  forbidden: "errors.page.forbidden-title",
  unauthorized: "errors.page.unauthorized-title",
  server: "errors.page.server-error-title",
  unavailable: "errors.page.service-unavailable-title",
  network: "errors.page.network-error-title",
  conflict: "errors.page.conflict-title",
  validation: "errors.page.validation-title",
  generic: "errors.page.generic-title",
};

const SUBTITLE_KEY_BY_KIND: Record<AppErrorKind, string> = {
  not_found: "errors.page.not-found",
  forbidden: "errors.page.forbidden",
  unauthorized: "errors.page.unauthorized",
  server: "errors.page.server-error",
  unavailable: "errors.page.service-unavailable",
  network: "errors.page.network-error",
  conflict: "errors.page.conflict",
  validation: "errors.page.validation",
  generic: "errors.page.generic",
};

const resolveResultStatus = (status: number): HttpErrorPresentation["resultStatus"] => {
  if (status === 404) return "404";
  if (status === 403 || status === 401) return "403";
  if (status >= 500 && status < 600) return "500";
  return "error";
};

/**
 * Код ошибки вместе с расшифровкой — единый формат для всех поверхностей
 * (страница, блок, alert в модалке, тост). Отдельная функция, потому что тост
 * переводится в base: через шину едут только status и kind.
 */
export const formatErrorCode = (status: number, kind: AppErrorKind, t: TFunction): string => {
  const title = t(TITLE_KEY_BY_KIND[kind]);
  return status > 0 ? `${status} · ${title}` : title;
};

export const resolveHttpErrorPresentation = (
  error: AppError,
  t: TFunction
): HttpErrorPresentation => {
  const { status, kind, serverMessage } = error;
  const showStatusInTitle = status > 0;

  return {
    kind,
    resultStatus: resolveResultStatus(status),
    title: t(TITLE_KEY_BY_KIND[kind]),
    subtitle: serverMessage?.trim() || t(SUBTITLE_KEY_BY_KIND[kind]),
    statusLabel: showStatusInTitle ? String(status) : undefined,
    showStatusInTitle,
    codeLine: formatErrorCode(status, kind, t),
  };
};
