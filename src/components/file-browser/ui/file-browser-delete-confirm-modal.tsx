import { useTranslation } from "react-i18next";

import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserLocaleOverrides } from "../model/types";

export interface FileBrowserDeleteConfirmModalProps {
  open: boolean;
  itemName?: string;
  locale?: FileBrowserLocaleOverrides;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FileBrowserDeleteConfirmModal({
  open,
  itemName,
  locale,
  confirmLoading,
  onConfirm,
  onCancel,
}: FileBrowserDeleteConfirmModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const message = itemName
    ? t("file-browser.actions.delete-confirm-named", {
        name: itemName,
        ...(locale?.actions?.deleteConfirmNamed != null
          ? { defaultValue: locale.actions.deleteConfirmNamed }
          : {}),
      })
    : labels.actions.deleteConfirm;

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
