export const FILE_BROWSER_ERROR_I18N_KEYS = {
  "directory-name-invalid": "file-browser.name-modal.name-invalid",
  "name-forbidden": "file-browser.name-modal.name-forbidden",
  "name-already-exists": "file-browser.notifications.name-already-exists",
  "directory-already-exists": "file-browser.notifications.directory-already-exists",
  "file-already-exists": "file-browser.notifications.file-already-exists",
  "parent-directory-missing": "file-browser.notifications.parent-directory-missing",
  "entry-not-in-current-directory": "file-browser.notifications.entry-not-in-current-directory",
  "file-not-in-current-directory": "file-browser.notifications.file-not-in-current-directory",
  "directory-not-in-current-directory":
    "file-browser.notifications.directory-not-in-current-directory",
  "create-error": "file-browser.notifications.create-error",
  "create-directory-error": "file-browser.notifications.create-directory-error",
  "create-file-error": "file-browser.notifications.create-file-error",
  "object-gone": "file-browser.notifications.object-gone",
  "directory-gone": "file-browser.notifications.directory-gone",
  "file-gone": "file-browser.notifications.file-gone",
  "remove-error": "file-browser.notifications.remove-error",
  "remove-directory-error": "file-browser.notifications.remove-directory-error",
  "remove-file-error": "file-browser.notifications.remove-file-error",
  "exists-check-error": "file-browser.notifications.exists-check-error",
  "path-not-found": "file-browser.notifications.path-not-found",
  "unknown-source": "file-browser.notifications.unknown-source",
  "no-sources": "file-browser.notifications.no-sources",
  "directory-unavailable": "file-browser.notifications.directory-unavailable",
  "operation-busy": "file-browser.notifications.operation-busy",
  "no-current-directory": "file-browser.notifications.no-current-directory",
  "listing-reload-error": "file-browser.notifications.listing-reload-error",
  "rename-error": "file-browser.notifications.rename-error",
  "file-too-large": "file-browser.notifications.file-too-large",
  "file-size-invalid": "file-browser.notifications.file-size-invalid",
  "binary-not-supported": "file-browser.notifications.binary-not-supported",
  "file-read-error": "file-browser.notifications.file-read-error",
  "file-too-large-to-save": "file-browser.notifications.file-too-large-to-save",
  "file-modified-externally": "file-browser.notifications.file-modified-externally",
  "file-write-error": "file-browser.notifications.file-write-error",
  "file-save-unconfirmed": "file-browser.notifications.file-save-unconfirmed",
  "download-error": "file-browser.download.error",
  "upload-cancelled": "file-browser.upload.cancelled",
  "upload-chunk": "file-browser.upload.chunk-error",
  "path-copy-error": "file-browser.notifications.path-copy-error",
} as const;

export type FileBrowserNotificationErrorCode = keyof typeof FILE_BROWSER_ERROR_I18N_KEYS;

export function getFileBrowserErrorI18nKey(errorCode: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(FILE_BROWSER_ERROR_I18N_KEYS, errorCode)) {
    return undefined;
  }
  return FILE_BROWSER_ERROR_I18N_KEYS[errorCode as FileBrowserNotificationErrorCode];
}
