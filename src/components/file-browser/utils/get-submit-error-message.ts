import type { AppError } from "../../../error-handling/app-error";

const FILE_BROWSER_SUBMIT_ERROR_BRAND = "saltbox.FileBrowserSubmitError";
const FILE_BROWSER_KEEP_MODAL_OPEN_ERROR_BRAND = "saltbox.FileBrowserKeepModalOpenError";

export class FileBrowserSubmitError extends Error {
  readonly __brand = FILE_BROWSER_SUBMIT_ERROR_BRAND;
  readonly appError: AppError | null;

  constructor(message: string, appError: AppError | null = null) {
    super(message);
    this.name = "FileBrowserSubmitError";
    this.appError = appError;
  }
}

export class FileBrowserKeepModalOpenError extends Error {
  readonly __brand = FILE_BROWSER_KEEP_MODAL_OPEN_ERROR_BRAND;

  constructor() {
    super("file-browser.keep-modal-open");
    this.name = "FileBrowserKeepModalOpenError";
  }
}

export function isFileBrowserSubmitError(error: unknown): error is FileBrowserSubmitError {
  if (error instanceof FileBrowserSubmitError) {
    return true;
  }
  return (
    typeof error === "object" &&
    error != null &&
    (error as { __brand?: unknown }).__brand === FILE_BROWSER_SUBMIT_ERROR_BRAND &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

export function isFileBrowserKeepModalOpenError(
  error: unknown
): error is FileBrowserKeepModalOpenError {
  if (error instanceof FileBrowserKeepModalOpenError) {
    return true;
  }
  return (
    typeof error === "object" &&
    error != null &&
    (error as { __brand?: unknown }).__brand === FILE_BROWSER_KEEP_MODAL_OPEN_ERROR_BRAND
  );
}

export type SubmitAppErrorPayload = { error: AppError; fallback: string };

export function getSubmitAppError(error: unknown): SubmitAppErrorPayload | null {
  if (!isFileBrowserSubmitError(error) || error.appError == null) {
    return null;
  }
  return { error: error.appError, fallback: error.message };
}

export function getSubmitErrorMessage(error: unknown): string | null {
  if (isFileBrowserKeepModalOpenError(error)) {
    return null;
  }
  if (!isFileBrowserSubmitError(error) || error.appError != null) {
    return null;
  }
  if (error.message.trim().length > 0) {
    return error.message;
  }
  return null;
}
