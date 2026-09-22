import { Button, Progress } from "antd";
import { observer } from "mobx-react-lite";

import { MutationErrorAlert } from "../../../error-handling/ui/mutation-error-alert";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserMessages } from "../hooks/use-file-browser-messages";
import {
  isFileBrowserTransferCancellable,
  isFileBrowserTransferInProgress,
  type FileBrowserTransferItem,
} from "../model/upload-types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";

import { FileBrowserUploadStatusIcon } from "./file-browser-upload-status-icon";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadListItemProps {
  uploadId: string;
  upload: FileBrowserTransferItem;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, upload: FileBrowserTransferItem) => string | undefined;
}

export const FileBrowserUploadListItem = observer(function FileBrowserUploadListItem({
  uploadId,
  upload,
  onCancelUpload,
  formatError,
}: FileBrowserUploadListItemProps) {
  const { translateError } = useFileBrowserMessages();

  const isDone = upload.status === "done";
  const percent = isDone
    ? 100
    : upload.total > 0
      ? Math.round((upload.loaded / upload.total) * 100)
      : 0;
  const sizeLoaded = isDone && upload.total > 0 ? upload.total : upload.loaded;
  const showProgress = upload.status !== "error";
  const progressStatus = isDone
    ? "success"
    : isFileBrowserTransferInProgress(upload.status)
      ? "active"
      : "normal";
  const errorFallback =
    upload.status === "error" && upload.error != null && upload.error !== ""
      ? (formatError?.(upload.error, upload) ?? translateError(upload.error) ?? upload.error)
      : undefined;

  return (
    <div className={styles.uploadItem}>
      <div className={styles.uploadItemRow}>
        <span
          className={
            upload.status === "done"
              ? styles.uploadStatusDone
              : upload.status === "error"
                ? styles.uploadStatusError
                : styles.uploadStatusActive
          }
        >
          <FileBrowserUploadStatusIcon status={upload.status} />
        </span>
        <span className={styles.uploadFileName} title={upload.fileName}>
          {upload.fileName}
        </span>
        <span className={styles.uploadSize}>
          {upload.status === "queued"
            ? formatFileBrowserSize(upload.total)
            : `${formatFileBrowserSize(sizeLoaded)} / ${formatFileBrowserSize(upload.total)}`}
        </span>
        <span className={styles.uploadCancelSlot}>
          {isFileBrowserTransferCancellable(upload.status) ? (
            <Button
              type="text"
              size="small"
              danger
              onClick={() => onCancelUpload(uploadId)}
              icon={<MatIcon icon="close" size="small" />}
            />
          ) : null}
        </span>
      </div>
      {showProgress && (
        <Progress
          percent={percent}
          size="small"
          showInfo={false}
          status={progressStatus}
          className={styles.uploadProgressBar}
        />
      )}
      {upload.status === "error" && upload.appError != null ? (
        <MutationErrorAlert error={upload.appError} fallback={errorFallback ?? upload.fileName} />
      ) : errorFallback != null ? (
        <div className={styles.uploadError}>{errorFallback}</div>
      ) : null}
    </div>
  );
});
