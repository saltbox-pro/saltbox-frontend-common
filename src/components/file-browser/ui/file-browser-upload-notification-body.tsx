import { Button } from "antd";
import { observer } from "mobx-react-lite";

import type { FileBrowserUploadItem } from "../model/upload-types";
import { groupUploadsByTargetDirectory } from "../utils/group-uploads-by-target-directory";
import { hasActiveFileBrowserUpload } from "../utils/has-active-file-browser-upload";

import { FileBrowserUploadList } from "./file-browser-upload-list";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadNotificationBodyProps {
  uploads: ReadonlyMap<string, FileBrowserUploadItem>;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, upload: FileBrowserUploadItem) => string | undefined;
  closeLabel: string;
  onRequestClose: () => void;
}

export const FileBrowserUploadNotificationBody = observer(
  function FileBrowserUploadNotificationBody({
    uploads,
    onCancelUpload,
    formatError,
    closeLabel,
    onRequestClose,
  }: FileBrowserUploadNotificationBodyProps) {
    const groups = groupUploadsByTargetDirectory(uploads);
    const showClose = !hasActiveFileBrowserUpload(uploads);

    return (
      <div>
        {groups.map(({ path, items }) => (
          <div key={path ?? "__no-path__"} className={styles.uploadNotificationGroup}>
            {path != null && (
              <div className={styles.uploadTargetPath} title={path}>
                {path}
              </div>
            )}
            <FileBrowserUploadList
              compact
              uploads={items}
              onCancelUpload={onCancelUpload}
              formatError={formatError}
            />
          </div>
        ))}
        {showClose && (
          <div className={styles.uploadNotificationFooter}>
            <Button
              type="link"
              size="small"
              className={styles.uploadNotificationCloseButton}
              onClick={onRequestClose}
            >
              {closeLabel}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
