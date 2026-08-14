import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getFileBrowserErrorI18nKey } from "../model/error-i18n-keys";
import { getFileBrowserSuccessI18nKey } from "../model/success-i18n-keys";

export type TranslateFileBrowserError = (
  code: string,
  params?: Record<string, unknown>
) => string | undefined;

export type TranslateFileBrowserSuccess = (
  key: string,
  params?: Record<string, unknown>
) => string | undefined;

export interface FileBrowserDownloadLabels {
  title: string;
  started: string;
  success: string;
  cancelled: string;
}

export interface FileBrowserActionLabels {
  copySaltPath: string;
  upload: string;
  cancel: string;
  retry: string;
  reload: string;
  goToRoot: string;
  toastClose: string;
  awaitingDisk: string;
}

export interface FileBrowserUploadLabels {
  title: string;
  dragText: string;
  hint: string;
}

export interface FileBrowserMessages {
  translateError: TranslateFileBrowserError;
  translateSuccess: TranslateFileBrowserSuccess;
  downloadLabels: FileBrowserDownloadLabels;
  actionLabels: FileBrowserActionLabels;
  uploadLabels: FileBrowserUploadLabels;
}

export function useFileBrowserMessages(): FileBrowserMessages {
  const { t } = useTranslation("common");

  const translateError = useCallback<TranslateFileBrowserError>(
    (code, params) => {
      const i18nKey = getFileBrowserErrorI18nKey(code);
      if (i18nKey == null) {
        return undefined;
      }
      return t(i18nKey, params);
    },
    [t]
  );

  const translateSuccess = useCallback<TranslateFileBrowserSuccess>(
    (key, params) => {
      const i18nKey = getFileBrowserSuccessI18nKey(key);
      if (i18nKey == null) {
        return undefined;
      }
      return t(i18nKey, params);
    },
    [t]
  );

  const downloadLabels = useMemo<FileBrowserDownloadLabels>(
    () => ({
      title: t("file-browser.download.title"),
      started: t("file-browser.download.started"),
      success: t("file-browser.download.success"),
      cancelled: t("file-browser.download.cancelled"),
    }),
    [t]
  );

  const actionLabels = useMemo<FileBrowserActionLabels>(
    () => ({
      copySaltPath: t("file-browser.actions.copy-salt-path"),
      upload: t("file-browser.actions.upload"),
      cancel: t("file-browser.actions.cancel"),
      retry: t("file-browser.retry"),
      reload: t("refresh-button.refresh"),
      goToRoot: t("file-browser.actions.go-to-root"),
      toastClose: t("action-button.close"),
      awaitingDisk: t("file-browser.awaiting-disk"),
    }),
    [t]
  );

  const uploadLabels = useMemo<FileBrowserUploadLabels>(
    () => ({
      title: t("file-browser.upload.title"),
      dragText: t("file-browser.upload.drag-text"),
      hint: t("file-browser.upload.hint"),
    }),
    [t]
  );

  return { translateError, translateSuccess, downloadLabels, actionLabels, uploadLabels };
}
