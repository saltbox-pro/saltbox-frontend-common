import { Alert, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { AppError } from "../../../error-handling/app-error";
import { MutationErrorAlert } from "../../../error-handling/ui/mutation-error-alert";
import { Modal } from "../../antd-wrappers/modal";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserPathStyle } from "../model/path-utils";
import type {
  FileBrowserBulkDeleteFailure,
  FileBrowserItem,
  FileBrowserLocaleOverrides,
} from "../model/types";
import {
  getBulkDeleteConfirmCopy,
  getBulkDeleteItemLabel,
  getBulkDeleteParentDirectory,
  getBulkDeletePartialFailureText,
  getBulkDeleteSummary,
} from "../utils/get-bulk-delete-confirm-copy";

import styles from "./file-browser.module.css";

export interface FileBrowserBulkDeleteConfirmModalProps {
  open: boolean;
  items: FileBrowserItem[];
  failures?: FileBrowserBulkDeleteFailure[];
  attemptedCount?: number;
  locale?: FileBrowserLocaleOverrides;
  pathStyle?: FileBrowserPathStyle;
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

export function FileBrowserBulkDeleteConfirmModal({
  open,
  items,
  failures = [],
  attemptedCount = 0,
  locale,
  pathStyle = "posix",
  okLoading,
  submitError = null,
  mutationError = null,
  mutationErrorFallback = "",
  onClearSubmitError,
  onClearMutationError,
  onConfirm,
  onCancel,
  afterClose,
}: FileBrowserBulkDeleteConfirmModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const summary = getBulkDeleteSummary(items);
  const {
    title,
    question,
    summary: summaryText,
    warning,
  } = getBulkDeleteConfirmCopy({
    summary,
    locale,
    t,
  });

  const parentDirectory = getBulkDeleteParentDirectory(items, pathStyle);
  const failureMessageById = new Map(failures.map((failure) => [failure.item.id, failure.message]));

  return (
    <Modal
      title={title}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      afterClose={afterClose}
      okText={labels.actions.yes}
      cancelText={labels.actions.cancel}
      okButtonProps={{
        danger: true,
        disabled: okLoading || items.length === 0,
        loading: okLoading,
      }}
      maskClosable
      closable
      keyboard
    >
      <MutationErrorAlert
        error={mutationError}
        fallback={mutationErrorFallback}
        onClose={onClearMutationError}
      />
      {submitError != null && submitError.length > 0 && (
        <Alert
          type="error"
          showIcon
          closable
          message={submitError}
          onClose={onClearSubmitError}
          style={{ marginBottom: 16 }}
        />
      )}
      {failures.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={getBulkDeletePartialFailureText({
            failed: failures.length,
            total: attemptedCount,
            locale,
            t,
          })}
          style={{ marginBottom: 16 }}
        />
      )}
      <p>{question}</p>
      <Typography.Text type="secondary">{summaryText}</Typography.Text>
      <div className={styles.bulkDeleteBlock}>
        {parentDirectory != null && (
          <code className={styles.bulkDeleteDirectory}>{parentDirectory}</code>
        )}
        <ul className={styles.bulkDeleteList}>
          {items.map((item) => {
            const failureMessage = failureMessageById.get(item.id);
            return (
              <li key={item.id} className={styles.bulkDeleteListItem}>
                <code className={styles.bulkDeleteListItemPath}>
                  {getBulkDeleteItemLabel(item, parentDirectory != null, pathStyle)}
                </code>
                {failureMessage && (
                  <div className={styles.bulkDeleteListItemError}>{failureMessage}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p>{warning}</p>
    </Modal>
  );
}
