import { useTranslation } from "react-i18next";

import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserItemKind, FileBrowserLocaleOverrides } from "../model/types";
import { getDeleteConfirmCopy } from "../utils/get-delete-confirm-copy";

import styles from "./file-browser.module.css";

export interface FileBrowserDeleteConfirmModalProps {
  open: boolean;
  itemName?: string;
  itemPath?: string;
  itemKind?: FileBrowserItemKind;
  locale?: FileBrowserLocaleOverrides;
  okLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  afterClose?: () => void;
}

export function FileBrowserDeleteConfirmModal({
  open,
  itemName = "",
  itemPath = "",
  itemKind = "file",
  locale,
  okLoading,
  onConfirm,
  onCancel,
  afterClose,
}: FileBrowserDeleteConfirmModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const path = itemPath.trim();
  const { title, question, warning } = getDeleteConfirmCopy({
    itemKind,
    itemName,
    locale,
    t,
  });

  return (
    <Modal
      title={title}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      afterClose={afterClose}
      okText={labels.actions.yes}
      cancelText={labels.actions.cancel}
      okButtonProps={{ danger: true, disabled: okLoading, loading: okLoading }}
      maskClosable
      closable
      keyboard
    >
      <p>{question}</p>
      {path.length > 0 && <code className={styles.deleteConfirmPath}>{path}</code>}
      <p>{warning}</p>
    </Modal>
  );
}
