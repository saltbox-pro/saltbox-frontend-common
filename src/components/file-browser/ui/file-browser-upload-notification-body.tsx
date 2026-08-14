import type { FileBrowserTransferItem } from "../model/upload-types";
import { groupUploadsByTargetDirectory } from "../utils/group-uploads-by-target-directory";

import { FileBrowserUploadList } from "./file-browser-upload-list";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadNotificationBodyProps {
  uploads: ReadonlyMap<string, FileBrowserTransferItem>;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
}

export function FileBrowserUploadNotificationBody({
  uploads,
  onCancelUpload,
  formatError,
}: FileBrowserUploadNotificationBodyProps) {
  const groups = groupUploadsByTargetDirectory(uploads);

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
    </div>
  );
}
