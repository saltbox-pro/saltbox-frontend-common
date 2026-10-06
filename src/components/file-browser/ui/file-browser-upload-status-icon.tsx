import type { ReactNode } from "react";

import { MatIcon } from "../../mat-icon";
import type { FileBrowserTransferStatus } from "../model/upload-types";

import styles from "./file-browser.module.css";

export function FileBrowserUploadStatusIcon({
  status,
}: {
  status: FileBrowserTransferStatus;
}): ReactNode {
  switch (status) {
    case "done":
      return <MatIcon icon="check_circle" size="small" />;
    case "error":
      return <MatIcon icon="error" size="small" />;
    case "queued":
      return <MatIcon icon="schedule" size="small" />;
    case "uploading":
    case "downloading":
    case "cancelling":
      return (
        <MatIcon
          icon="progress_activity"
          size="small"
          className={`material-symbols-outlined ${styles.uploadProgressIcon}`}
        />
      );
    default:
      return null;
  }
}
