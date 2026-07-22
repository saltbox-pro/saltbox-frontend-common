import type { HttpErrorKind } from "../types/resource-load-error";

export const mapStatusToKind = (status: number): HttpErrorKind => {
  if (status === 0) return "network";
  if (status === 404) return "not_found";
  if (status === 403) return "forbidden";
  if (status >= 500) return "server";
  if (status === 503) return "unavailable";
  return "generic";
};

export const getHttpStatusFromError = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null;

  const response = (error as { response?: Response }).response;
  if (response && typeof response.status === "number") {
    return response.status;
  }

  const name = (error as { name?: string }).name;
  if (name === "FetchError") return 0;

  return null;
};
