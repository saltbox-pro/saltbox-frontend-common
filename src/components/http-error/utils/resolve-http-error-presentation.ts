import type { TFunction } from "i18next";

import type { ResourceLoadError } from "../types/resource-load-error";

export type HttpErrorPresentation = {
  resultStatus: "404" | "403" | "500" | "error";
  title: string;
  subtitle: string;
  showStatusInTitle: boolean;
};

export const resolveHttpErrorPresentation = (
  error: ResourceLoadError,
  t: TFunction
): HttpErrorPresentation => {
  const { status, kind, message } = error;

  const subtitleBykind: Record<ResourceLoadError["kind"], string> = {
    not_found: t("errors.page.not-found"),
    forbidden: t("errors.page.forbidden"),
    server: t("errors.page.server-error"),
    unavailable: t("errors.page.service-unavailable"),
    network: t("errors.page.network-error"),
    generic: t("errors.page.generic"),
  };

  const subtitle = message?.trim() || subtitleBykind[kind];

  if (status === 404) {
    return { resultStatus: "404", title: "404", subtitle, showStatusInTitle: true };
  }
  if (status === 403) {
    return { resultStatus: "403", title: "403", subtitle, showStatusInTitle: true };
  }
  if (status === 500) {
    return { resultStatus: "500", title: "500", subtitle, showStatusInTitle: true };
  }
  return {
    resultStatus: "error",
    title: status > 0 ? String(status) : t("errors.page.network-error"),
    subtitle,
    showStatusInTitle: status > 0,
  };
};
