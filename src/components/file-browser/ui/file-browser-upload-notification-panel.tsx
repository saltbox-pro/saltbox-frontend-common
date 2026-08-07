import type { FileBrowserUploadItem } from "../model/upload-types";

import { FileBrowserUploadNotificationBody } from "./file-browser-upload-notification-body";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadNotificationPanelProps {
  title: string;
  uploads: ReadonlyMap<string, FileBrowserUploadItem>;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
  closeLabel: string;
  onRequestClose: () => void;
}

export function FileBrowserUploadNotificationPanel({
  title,
  uploads,
  onCancelUpload,
  formatError,
  closeLabel,
  onRequestClose,
}: FileBrowserUploadNotificationPanelProps) {
  return (
    <div className={styles.uploadNotificationPanel} role="status" aria-live="polite">
      <div className={styles.uploadNotificationTitle}>{title}</div>
      <FileBrowserUploadNotificationBody
        uploads={uploads}
        onCancelUpload={onCancelUpload}
        formatError={formatError}
        closeLabel={closeLabel}
        onRequestClose={onRequestClose}
      />
    </div>
  );
}
