import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { FileBrowserLocaleOverrides } from "../model/types";

export function useFileBrowserLocale(overrides?: FileBrowserLocaleOverrides) {
  const { t } = useTranslation("common");

  return useMemo(
    () => ({
      empty: overrides?.empty ?? t("file-browser.empty"),
      awaitingDisk: overrides?.awaitingDisk ?? t("file-browser.awaiting-disk"),
      retry: overrides?.retry ?? t("file-browser.retry"),
      columns: {
        name: overrides?.columns?.name ?? t("file-browser.columns.name"),
        type: overrides?.columns?.type ?? t("file-browser.columns.type"),
        size: overrides?.columns?.size ?? t("file-browser.columns.size"),
        modified: overrides?.columns?.modified ?? t("file-browser.columns.modified"),
        actions: overrides?.columns?.actions ?? t("file-browser.columns.actions"),
      },
      type: {
        directory: overrides?.type?.directory ?? t("file-browser.type.directory"),
        file: overrides?.type?.file ?? t("file-browser.type.file"),
      },
      nameModal: {
        nameRequired:
          overrides?.nameModal?.nameRequired ?? t("file-browser.name-modal.name-required"),
        directoryNameRequired:
          overrides?.nameModal?.directoryNameRequired ??
          t("file-browser.name-modal.directory-name-required"),
        fileNameRequired:
          overrides?.nameModal?.fileNameRequired ?? t("file-browser.name-modal.file-name-required"),
        nameInvalid: overrides?.nameModal?.nameInvalid ?? t("file-browser.name-modal.name-invalid"),
        nameForbidden:
          overrides?.nameModal?.nameForbidden ?? t("file-browser.name-modal.name-forbidden"),
      },
      actions: {
        download: overrides?.actions?.download ?? t("file-browser.actions.download"),
        rename: overrides?.actions?.rename ?? t("file-browser.actions.rename"),
        renameTitleFile:
          overrides?.actions?.renameTitleFile ?? t("file-browser.actions.rename-title-file"),
        renameTitleDirectory:
          overrides?.actions?.renameTitleDirectory ??
          t("file-browser.actions.rename-title-directory"),
        delete: overrides?.actions?.delete ?? t("file-browser.actions.delete"),
        yes: overrides?.actions?.yes ?? t("file-browser.actions.yes"),
        cancel: overrides?.actions?.cancel ?? t("file-browser.actions.cancel"),
        createFolder:
          overrides?.actions?.createFolder ?? t("file-browser.actions.create-directory"),
        createFile: overrides?.actions?.createFile ?? t("file-browser.actions.create-file"),
        create: overrides?.actions?.create ?? t("file-browser.actions.create"),
        folderNamePlaceholder:
          overrides?.actions?.folderNamePlaceholder ??
          t("file-browser.actions.directory-name-placeholder"),
        fileNamePlaceholder:
          overrides?.actions?.fileNamePlaceholder ??
          t("file-browser.actions.file-name-placeholder"),
        newNamePlaceholder:
          overrides?.actions?.newNamePlaceholder ?? t("file-browser.actions.new-name-placeholder"),
      },
    }),
    [overrides, t]
  );
}
