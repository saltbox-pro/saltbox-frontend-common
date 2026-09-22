import { AppError, normalizeApiError } from "./app-error";
import { notifyAppError } from "./notify-app-error";

export async function notifyApiError(error: unknown, title: string): Promise<AppError> {
  const appError = await normalizeApiError(error);
  notifyAppError(appError, title);
  return appError;
}
