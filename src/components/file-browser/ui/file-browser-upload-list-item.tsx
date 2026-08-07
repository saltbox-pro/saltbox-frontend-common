import { Button, Progress } from "antd";
import { observer } from "mobx-react-lite";

import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserMessages } from "../hooks/use-file-browser-messages";
import type { FileBrowserUploadItem } from "../model/upload-types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";

import { FileBrowserUploadStatusIcon } from "./file-browser-upload-status-icon";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadListItemProps {
  uploadId: string;
  upload: FileBrowserUploadItem;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
}

export const FileBrowserUploadListItem = observer(function FileBrowserUploadListItem({
  uploadId,
  upload,
  onCancelUpload,
  formatError,
}: FileBrowserUploadListItemProps) {
  const { translateError } = useFileBrowserMessages();

  const percent =
    upload.status === "done"
      ? 100
      : upload.total > 0
        ? Math.round((upload.loaded / upload.total) * 100)
        : 0;
  const errorText =
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
          {upload.status === "done" || upload.status === "queued"
            ? formatFileBrowserSize(upload.total)
            : `${formatFileBrowserSize(upload.loaded)} / ${formatFileBrowserSize(upload.total)}`}
        </span>
        <span className={styles.uploadCancelSlot}>
          {upload.status === "uploading" || upload.status === "queued" ? (
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
      {upload.status === "uploading" && (
        <Progress
          percent={percent}
          size="small"
          showInfo={false}
          status="active"
          className={styles.uploadProgressBar}
        />
      )}
      {errorText != null && <div className={styles.uploadError}>{errorText}</div>}
    </div>
  );
});
