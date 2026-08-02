import type { TFunction } from "i18next";

import type { AppError, AppErrorKind } from "../app-error";

export type HttpErrorPresentation = {
  kind: AppErrorKind;
  resultStatus: "404" | "403" | "500" | "error";
  title: string;
  subtitle: string;
  statusLabel?: string;
  showStatusInTitle: boolean;
};

const resolveResultStatus = (status: number): HttpErrorPresentation["resultStatus"] => {
  if (status === 404) return "404";
  if (status === 403 || status === 401) return "403";
  if (status >= 500 && status < 600) return "500";
  return "error";
};

export const resolveHttpErrorPresentation = (
  error: AppError,
  t: TFunction
): HttpErrorPresentation => {
  const { status, kind, serverMessage } = error;

  const titleByKind: Record<AppErrorKind, string> = {
    not_found: t("errors.page.not-found-title"),
    forbidden: t("errors.page.forbidden-title"),
    unauthorized: t("errors.page.unauthorized-title"),
    server: t("errors.page.server-error-title"),
    unavailable: t("errors.page.service-unavailable-title"),
    network: t("errors.page.network-error-title"),
    conflict: t("errors.page.conflict-title"),
    validation: t("errors.page.validation-title"),
    generic: t("errors.page.generic-title"),
  };

  const subtitleByKind: Record<AppErrorKind, string> = {
    not_found: t("errors.page.not-found"),
    forbidden: t("errors.page.forbidden"),
    unauthorized: t("errors.page.unauthorized"),
    server: t("errors.page.server-error"),
    unavailable: t("errors.page.service-unavailable"),
    network: t("errors.page.network-error"),
    conflict: t("errors.page.conflict"),
    validation: t("errors.page.validation"),
    generic: t("errors.page.generic"),
  };

  const showStatusInTitle = status > 0;

  return {
    kind,
    resultStatus: resolveResultStatus(status),
    title: titleByKind[kind],
    subtitle: serverMessage?.trim() || subtitleByKind[kind],
    statusLabel: showStatusInTitle ? String(status) : undefined,
    showStatusInTitle,
  };
};
