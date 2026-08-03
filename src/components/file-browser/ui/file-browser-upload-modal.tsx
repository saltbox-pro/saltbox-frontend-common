import { Button, Progress, Spin, Upload } from "antd";
import type { ReactNode } from "react";

import { Modal } from "../../antd-wrappers/modal";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserMessages } from "../hooks/use-file-browser-messages";
import type {
  FileBrowserUploadFileHandler,
  FileBrowserUploadItem,
  FileBrowserUploadStatus,
} from "../model/upload-types";
import { formatFileBrowserSize } from "../utils/format-file-browser-size";

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

  const hasActive = Array.from(uploads.values()).some((upload) => upload.status === "uploading");

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
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} disabled={hasActive}>
              {actionLabels.cancel}
            </Button>
          </div>
        ) : null
      }
    >
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
        <p style={{ fontSize: 48, color: "#1677ff", margin: 0 }}>
          <MatIcon icon="cloud_upload" />
        </p>
        <p style={{ fontSize: 16, marginTop: 8 }}>{uploadLabels.dragText}</p>
        <p style={{ color: "#888" }}>{uploadLabels.hint}</p>
      </Dragger>

      {uploads.size > 0 && (
        <div style={{ marginTop: 16, maxHeight: 300, overflowY: "auto" }}>
          {Array.from(uploads.entries()).map(([id, upload]) => {
            const percent = upload.total > 0 ? Math.round((upload.loaded / upload.total) * 100) : 0;

            return (
              <div
                key={id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      color:
                        upload.status === "done"
                          ? "#52c41a"
                          : upload.status === "error"
                            ? "#ff4d4f"
                            : "#1677ff",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {statusIcon(upload.status)}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={upload.fileName}
                  >
                    {upload.fileName}
                  </span>
                  <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>
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
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        color: "#888",
                      }}
                    >
                      <Spin size="small" />
                      {uploadLabels.preparing}
                    </div>
                  ) : (
                    <Progress
                      percent={percent}
                      size="small"
                      showInfo={false}
                      status="active"
                      style={{ marginTop: 4 }}
                    />
                  ))}
                {upload.status === "error" && upload.error != null && upload.error !== "" && (
                  <div style={{ fontSize: 12, color: "#ff4d4f", marginTop: 2 }}>
                    {translateError(upload.error) ?? formatError?.(upload.error) ?? upload.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
