export const FILE_BROWSER_ERROR_I18N_KEYS = {
  "directory-name-invalid": "file-browser.name-modal.name-invalid",
  "name-already-exists": "file-browser.notifications.name-already-exists",
  "parent-directory-missing": "file-browser.notifications.parent-directory-missing",
  "create-error": "file-browser.notifications.create-error",
  "object-gone": "file-browser.notifications.object-gone",
  "remove-error": "file-browser.notifications.remove-error",
  "exists-check-error": "file-browser.notifications.exists-check-error",
  "path-not-found": "file-browser.notifications.path-not-found",
  "directory-unavailable": "file-browser.notifications.directory-unavailable",
  "operation-busy": "file-browser.notifications.operation-busy",
  "no-current-directory": "file-browser.notifications.no-current-directory",
  "listing-reload-error": "file-browser.notifications.listing-reload-error",
  "rename-error": "file-browser.notifications.rename-error",
} as const;

export type FileBrowserNotificationErrorCode = keyof typeof FILE_BROWSER_ERROR_I18N_KEYS;

export function getFileBrowserErrorI18nKey(errorCode: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(FILE_BROWSER_ERROR_I18N_KEYS, errorCode)) {
    return undefined;
  }
  return FILE_BROWSER_ERROR_I18N_KEYS[errorCode as FileBrowserNotificationErrorCode];
}
