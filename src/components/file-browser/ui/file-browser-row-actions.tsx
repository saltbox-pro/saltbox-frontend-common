import { DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { MouseEvent, ReactNode } from "react";

import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";

import styles from "./file-browser.module.css";

export interface FileBrowserRowActionsProps {
  isDirectory?: boolean;
  disabled?: boolean;
  downloadTitle?: string;
  renameTitle?: string;
  deleteTitle?: string;
  onDownload?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  leadingActions?: ReactNode;
  trailingActions?: ReactNode;
}

function stopRowClick(event: MouseEvent) {
  event.stopPropagation();
}

export function FileBrowserRowActions({
  isDirectory = false,
  disabled = false,
  downloadTitle,
  renameTitle,
  deleteTitle,
  onDownload,
  onRename,
  onDelete,
  leadingActions,
  trailingActions,
}: FileBrowserRowActionsProps) {
  const labels = useFileBrowserLocale();
  const resolvedDownloadTitle = downloadTitle ?? labels.actions.download;
  const resolvedRenameTitle = renameTitle ?? labels.actions.rename;
  const resolvedDeleteTitle = deleteTitle ?? labels.actions.delete;

  const downloadLocked = disabled || isDirectory;

  return (
    <div className={`${styles.rowActions}${disabled ? ` ${styles.rowActionsLocked}` : ""}`}>
      {leadingActions}

      {onDownload && (
        <Button
          type="default"
          icon={<DownloadOutlined />}
          shape="circle"
          title={resolvedDownloadTitle}
          aria-label={resolvedDownloadTitle}
          disabled={isDirectory}
          aria-disabled={downloadLocked || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(event) => {
            stopRowClick(event);
            if (downloadLocked) {
              return;
            }
            onDownload();
          }}
        />
      )}

      {onRename && (
        <Button
          type="default"
          icon={<EditOutlined />}
          shape="circle"
          title={resolvedRenameTitle}
          aria-label={resolvedRenameTitle}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(event) => {
            stopRowClick(event);
            if (disabled) {
              return;
            }
            onRename();
          }}
        />
      )}

      {onDelete && (
        <Button
          danger
          icon={<DeleteOutlined />}
          shape="circle"
          title={resolvedDeleteTitle}
          aria-label={resolvedDeleteTitle}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(event) => {
            stopRowClick(event);
            if (disabled) {
              return;
            }
            onDelete();
          }}
        />
      )}

      {trailingActions}
    </div>
  );
}
