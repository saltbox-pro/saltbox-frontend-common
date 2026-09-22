import { Alert } from "antd";
import { useTranslation } from "react-i18next";

import type { AppError } from "../../../error-handling/app-error";
import { MutationErrorAlert } from "../../../error-handling/ui/mutation-error-alert";
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
  submitError?: string | null;
  mutationError?: AppError | null;
  mutationErrorFallback?: string;
  onClearSubmitError?: () => void;
  onClearMutationError?: () => void;
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
  submitError = null,
  mutationError = null,
  mutationErrorFallback = "",
  onClearSubmitError,
  onClearMutationError,
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
      <MutationErrorAlert
        error={mutationError}
        fallback={mutationErrorFallback}
        onClose={onClearMutationError}
      />
      {submitError != null && submitError.length > 0 ? (
        <Alert
          type="error"
          showIcon
          closable
          message={submitError}
          onClose={onClearSubmitError}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      <p>{question}</p>
      {path.length > 0 && <code className={styles.deleteConfirmPath}>{path}</code>}
      <p>{warning}</p>
    </Modal>
  );
}
