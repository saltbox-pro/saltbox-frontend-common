import type { ResourceLoadError } from "../types/resource-load-error";

import { getHttpStatusFromError, mapStatusToKind } from "./get-http-status-from-error";

type CreateResourceLoadErrorProps = {
  fallbackStatus?: number;
  fallbackMessage?: string;
};

export const createResourceLoadError = (
  error: unknown,
  props: CreateResourceLoadErrorProps = {}
): ResourceLoadError => {
  const status = getHttpStatusFromError(error) ?? props.fallbackStatus ?? 500;
  const kind = mapStatusToKind(status);

  return {
    status,
    kind,
    message: props.fallbackMessage,
  };
};

export const createNotFoundError = (message?: string): ResourceLoadError => ({
  status: 404,
  kind: "not_found",
  message,
});
