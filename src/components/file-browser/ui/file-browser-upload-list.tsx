import { observer } from "mobx-react-lite";

import type { FileBrowserTransferItem } from "../model/upload-types";

import { FileBrowserUploadListItem } from "./file-browser-upload-list-item";
import styles from "./file-browser.module.css";

export interface FileBrowserUploadListProps<
  TItem extends FileBrowserTransferItem = FileBrowserTransferItem,
> {
  uploads: ReadonlyMap<string, TItem>;
  onCancelUpload: (uploadId: string) => void;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
  compact?: boolean;
}

export const FileBrowserUploadList = observer(function FileBrowserUploadList<
  TItem extends FileBrowserTransferItem = FileBrowserTransferItem,
>({ uploads, onCancelUpload, formatError, compact = false }: FileBrowserUploadListProps<TItem>) {
  if (uploads.size === 0) {
    return null;
  }

  return (
    <div className={compact ? styles.uploadListCompact : styles.uploadList}>
      {Array.from(uploads.entries()).map(([id, upload]) => (
        <FileBrowserUploadListItem
          key={id}
          uploadId={id}
          upload={upload}
          onCancelUpload={onCancelUpload}
          formatError={formatError}
        />
      ))}
    </div>
  );
});
