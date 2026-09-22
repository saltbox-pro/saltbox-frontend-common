import { notify } from "../notifications/model/notify";

import { type AppError, buildErrorDebugText } from "./app-error";

export function notifyAppError(error: AppError, title: string): void {
  notify.error({
    title,
    description: error.serverMessage,
    errorCode: { status: error.status, kind: error.kind },
    debugText: error.diagnostics ? buildErrorDebugText(error) : undefined,
  });
}
