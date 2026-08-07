import { Button, Progress, Spin, Upload, theme } from "antd";
import type { CSSProperties, ReactNode } from "react";

import { Modal } from "../../antd-wrappers/modal";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserMessages } from "../hooks/use-file-browser-messages";
import type {
  FileBrowserUploadFileHandler,
  FileBrowserUploadItem,
  FileBrowserUploadStatus,
} from "../model/upload-types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";

import styles from "./file-browser-upload-modal.module.css";

const { Dragger } = Upload;

export interface FileBrowserUploadModalProps<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
> {
  open: boolean;
  disabled?: boolean;
  onClose: () => void;
  onUpload: FileBrowserUploadFileHandler;
  uploads: ReadonlyMap<string, TItem>;
  onCancelUpload: (uploadId: string) => void;
  onClearFinished: () => void;
  formatError?: (errorCode: string) => string | undefined;
}

const statusIcon = (status: FileBrowserUploadStatus): ReactNode => {
  switch (status) {
    case "done":
      return <MatIcon icon="check_circle" size="small" />;
    case "error":
      return <MatIcon icon="error" size="small" />;
    default:
      return null;
  }
};

const statusIconClass = (status: FileBrowserUploadStatus): string => {
  switch (status) {
    case "done":
      return `${styles.statusIcon} ${styles.statusIconDone}`;
    case "error":
      return `${styles.statusIcon} ${styles.statusIconError}`;
    default:
      return styles.statusIcon;
  }
};

export function FileBrowserUploadModal<
  TItem extends FileBrowserUploadItem = FileBrowserUploadItem,
>({
  open,
  disabled = false,
  onClose,
  onUpload,
  uploads,
  onCancelUpload,
  onClearFinished,
  formatError,
}: FileBrowserUploadModalProps<TItem>) {
  const { translateError, actionLabels, uploadLabels } = useFileBrowserMessages();
  const { token } = theme.useToken();

  const hasActive = Array.from(uploads.values()).some((upload) => upload.status === "uploading");

  const tokenStyle = {
    "--fb-primary": token.colorPrimary,
    "--fb-text-secondary": token.colorTextDescription,
    "--fb-split": token.colorSplit,
    "--fb-success": token.colorSuccess,
    "--fb-error": token.colorError,
  } as CSSProperties;

  const handleClose = () => {
    if (hasActive) {
      return;
    }
    onClearFinished();
    onClose();
  };

  return (
    <Modal
      title={uploadLabels.title}
      open={open}
      onCancel={handleClose}
      maskClosable={!hasActive}
      destroyOnHidden={false}
      footer={
        uploads.size > 0 ? (
          <div className={styles.footer}>
            <Button onClick={handleClose} disabled={hasActive}>
              {actionLabels.cancel}
            </Button>
          </div>
        ) : null
      }
    >
      <div style={tokenStyle}>
        <Dragger
          multiple
          disabled={disabled}
          showUploadList={false}
          beforeUpload={(file) => {
            if (disabled) {
              return false;
            }
            Promise.resolve(onUpload(file)).catch(() => undefined);
            return false;
          }}
        >
          <p className={styles.uploadIcon}>
            <MatIcon icon="cloud_upload" />
          </p>
          <p className={styles.dragText}>{uploadLabels.dragText}</p>
          <p className={styles.dragHint}>{uploadLabels.hint}</p>
        </Dragger>

        {uploads.size > 0 && (
          <div className={styles.list}>
            {Array.from(uploads.entries()).map(([id, upload]) => {
              const percent =
                upload.total > 0 ? Math.round((upload.loaded / upload.total) * 100) : 0;

              return (
                <div key={id} className={styles.item}>
                  <div className={styles.itemRow}>
                    <span className={statusIconClass(upload.status)}>
                      {statusIcon(upload.status)}
                    </span>
                    <span className={styles.fileName} title={upload.fileName}>
                      {upload.fileName}
                    </span>
                    <span className={styles.fileSize}>
                      {upload.status === "done"
                        ? formatFileBrowserSize(upload.total)
                        : `${formatFileBrowserSize(upload.loaded)} / ${formatFileBrowserSize(upload.total)}`}
                    </span>
                    {upload.status === "uploading" && (
                      <Button
                        type="text"
                        size="small"
                        danger
                        onClick={() => onCancelUpload(id)}
                        icon={<MatIcon icon="close" size="small" />}
                      />
                    )}
                  </div>
                  {upload.status === "uploading" &&
                    (upload.loaded === 0 ? (
                      <div className={styles.preparing}>
                        <Spin size="small" />
                        {uploadLabels.preparing}
                      </div>
                    ) : (
                      <Progress
                        percent={percent}
                        size="small"
                        showInfo={false}
                        status="active"
                        className={styles.progress}
                      />
                    ))}
                  {upload.status === "error" && upload.error != null && upload.error !== "" && (
                    <div className={styles.itemError}>
                      {translateError(upload.error) ?? formatError?.(upload.error) ?? upload.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
