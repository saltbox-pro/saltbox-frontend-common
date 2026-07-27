import { isGlobalServerError } from "../../../utils/server-error-middleware";

const FILE_BROWSER_SUBMIT_ERROR_BRAND = "saltbox.FileBrowserSubmitError";

export class FileBrowserSubmitError extends Error {
  readonly __brand = FILE_BROWSER_SUBMIT_ERROR_BRAND;

  constructor(message: string) {
    super(message);
    this.name = "FileBrowserSubmitError";
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

export function getSubmitErrorMessage(error: unknown): string | null {
  if (isGlobalServerError(error)) {
    return null;
  }
  if (isFileBrowserSubmitError(error) && error.message.trim().length > 0) {
    return error.message;
  }
  return null;
}
