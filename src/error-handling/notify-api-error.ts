import { notify } from "../notifications/model/notify";

import { AppError, buildErrorDebugText, normalizeApiError } from "./app-error";

export async function notifyApiError(error: unknown, title: string): Promise<AppError> {
  const appError = await normalizeApiError(error);

  notify.error({
    title,
    description: appError.serverMessage,
    errorCode: { status: appError.status, kind: appError.kind },
    debugText: appError.diagnostics ? buildErrorDebugText(appError) : undefined,
  });

  return appError;
}
