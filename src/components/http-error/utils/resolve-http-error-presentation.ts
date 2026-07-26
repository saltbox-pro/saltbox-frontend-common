import type { TFunction } from "i18next";

import type { HttpErrorKind, ResourceLoadError } from "../types/resource-load-error";

export type HttpErrorPresentation = {
  kind: HttpErrorKind;
  resultStatus: "404" | "403" | "500" | "error";
  title: string;
  subtitle: string;
  statusLabel?: string;
  showStatusInTitle: boolean;
};

const resolveResultStatus = (status: number): HttpErrorPresentation["resultStatus"] => {
  if (status === 404) return "404";
  if (status === 403) return "403";
  if (status === 500) return "500";
  return "error";
};

export const resolveHttpErrorPresentation = (
  error: ResourceLoadError,
  t: TFunction
): HttpErrorPresentation => {
  const { status, kind, message } = error;

  const titleByKind: Record<HttpErrorKind, string> = {
    not_found: t("errors.page.not-found-title"),
    forbidden: t("errors.page.forbidden-title"),
    server: t("errors.page.server-error-title"),
    unavailable: t("errors.page.service-unavailable-title"),
    network: t("errors.page.network-error-title"),
    generic: t("errors.page.generic-title"),
  };

  const subtitleByKind: Record<HttpErrorKind, string> = {
    not_found: t("errors.page.not-found"),
    forbidden: t("errors.page.forbidden"),
    server: t("errors.page.server-error"),
    unavailable: t("errors.page.service-unavailable"),
    network: t("errors.page.network-error"),
    generic: t("errors.page.generic"),
  };

  const showStatusInTitle = status > 0;

  return {
    kind,
    resultStatus: resolveResultStatus(status),
    title: titleByKind[kind],
    subtitle: message?.trim() || subtitleByKind[kind],
    statusLabel: showStatusInTitle ? String(status) : undefined,
    showStatusInTitle,
  };
};
