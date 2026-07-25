import { useTranslation } from "react-i18next";

import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserItemKind, FileBrowserLocaleOverrides } from "../model/types";

export interface FileBrowserDeleteConfirmModalProps {
  open: boolean;
  itemName?: string;
  itemKind?: FileBrowserItemKind;
  locale?: FileBrowserLocaleOverrides;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FileBrowserDeleteConfirmModal({
  open,
  itemName,
  itemKind = "file",
  locale,
  confirmLoading,
  onConfirm,
  onCancel,
}: FileBrowserDeleteConfirmModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const kindKey = itemKind === "directory" ? "directory" : "file";
  const overrideMessage = itemName
    ? kindKey === "directory"
      ? locale?.actions?.deleteConfirmDirectoryNamed
      : locale?.actions?.deleteConfirmFileNamed
    : kindKey === "directory"
      ? locale?.actions?.deleteConfirmDirectory
      : locale?.actions?.deleteConfirmFile;

  const message =
    overrideMessage ??
    (itemName
      ? t(`file-browser.actions.delete-confirm-${kindKey}-named`, { name: itemName })
      : t(`file-browser.actions.delete-confirm-${kindKey}`));

  return (
    <Modal
      title={labels.actions.delete}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={labels.actions.yes}
      cancelText={labels.actions.cancel}
      confirmLoading={confirmLoading}
      okButtonProps={{ danger: true }}
    >
      <p>{message}</p>
    </Modal>
  );
}
