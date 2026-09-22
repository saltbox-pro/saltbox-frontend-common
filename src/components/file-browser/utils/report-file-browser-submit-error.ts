import { notifyAppError } from "../../../error-handling/notify-app-error";

import {
  getSubmitAppError,
  getSubmitErrorMessage,
  type SubmitAppErrorPayload,
} from "./get-submit-error-message";

export type ReportFileBrowserSubmitErrorHandlers = {
  modalOpen: boolean;
  onModalAppError: (payload: SubmitAppErrorPayload) => void;
  onModalMessage: (message: string) => void;
  onClosedMessage?: (message: string) => void;
};

export function reportFileBrowserSubmitError(
  error: unknown,
  handlers: ReportFileBrowserSubmitErrorHandlers
): void {
  const appError = getSubmitAppError(error);
  if (appError != null) {
    if (handlers.modalOpen) {
      handlers.onModalAppError(appError);
      return;
    }
    notifyAppError(appError.error, appError.fallback);
    return;
  }

  const message = getSubmitErrorMessage(error);
  if (message == null) {
    return;
  }
  if (handlers.modalOpen) {
    handlers.onModalMessage(message);
    return;
  }
  handlers.onClosedMessage?.(message);
}
