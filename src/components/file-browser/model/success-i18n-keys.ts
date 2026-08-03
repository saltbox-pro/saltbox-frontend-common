export const FILE_BROWSER_SUCCESS_I18N_KEYS = {
  "file-save-success": "file-browser.notifications.file-save-success",
  "salt-path-copied": "file-browser.notifications.salt-path-copied",
  "create-directory-success": "file-browser.notifications.create-directory-success",
  "create-file-success": "file-browser.notifications.create-file-success",
  "delete-file-success": "file-browser.notifications.delete-file-success",
  "delete-directory-success": "file-browser.notifications.delete-directory-success",
  "rename-file-success": "file-browser.notifications.rename-file-success",
  "rename-directory-success": "file-browser.notifications.rename-directory-success",
} as const;

export type FileBrowserNotificationSuccessKey = keyof typeof FILE_BROWSER_SUCCESS_I18N_KEYS;

export function getFileBrowserSuccessI18nKey(successKey: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(FILE_BROWSER_SUCCESS_I18N_KEYS, successKey)) {
    return undefined;
  }
  return FILE_BROWSER_SUCCESS_I18N_KEYS[successKey as FileBrowserNotificationSuccessKey];
}
