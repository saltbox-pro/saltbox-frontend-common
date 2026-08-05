import { Button, Upload } from "antd";
import { observer } from "mobx-react-lite";

import { Modal } from "../../antd-wrappers/modal";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserMessages } from "../hooks/use-file-browser-messages";
import type { FileBrowserUploadFileHandler, FileBrowserUploadItem } from "../model/upload-types";
import { hasActiveFileBrowserUpload } from "../utils/has-active-file-browser-upload";

import { FileBrowserUploadList } from "./file-browser-upload-list";
import styles from "./file-browser.module.css";

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
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
}

export const FileBrowserUploadModal = observer(function FileBrowserUploadModal<
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
  const { actionLabels, uploadLabels } = useFileBrowserMessages();

  const handleClose = () => {
    if (!hasActiveFileBrowserUpload(uploads)) {
      onClearFinished();
    }
    onClose();
  };

  return (
    <Modal
      title={uploadLabels.title}
      open={open}
      onCancel={handleClose}
      maskClosable
      destroyOnHidden={false}
      footer={
        uploads.size > 0 ? (
          <div className={styles.uploadModalFooter}>
            <Button onClick={handleClose}>{actionLabels.toastClose}</Button>
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
        <p className={styles.uploadDraggerIcon}>
          <MatIcon icon="cloud_upload" />
        </p>
        <p className={styles.uploadDraggerText}>{uploadLabels.dragText}</p>
        <p className={styles.uploadDraggerHint}>{uploadLabels.hint}</p>
      </Dragger>

      <FileBrowserUploadList
        uploads={uploads}
        onCancelUpload={onCancelUpload}
        formatError={formatError}
      />
    </Modal>
  );
});
