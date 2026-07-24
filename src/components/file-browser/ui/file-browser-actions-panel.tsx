import { Button } from "antd";
import { type ReactNode, useCallback, useState } from "react";

import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isSafePathSegment } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";

import { FileBrowserDeleteConfirmModal } from "./file-browser-delete-confirm-modal";
import { FileBrowserNameModal } from "./file-browser-name-modal";
import { FileBrowserRowActions } from "./file-browser-row-actions";
import styles from "./file-browser.module.css";

export interface FileBrowserActionsPanelRenderProps {
  toolbar: ReactNode;
  renderRowActions: (item: FileBrowserItem) => ReactNode;
}

export interface FileBrowserActionsPanelProps {
  disabled?: boolean;
  locale?: FileBrowserLocaleOverrides;
  onDownload?: (item: FileBrowserItem) => void | Promise<void>;
  onRename?: (item: FileBrowserItem, newName: string) => void | Promise<void>;
  onDelete?: (item: FileBrowserItem) => void | Promise<void>;
  onCreateFolder?: (name: string) => void | Promise<void>;
  onCreateFile?: (name: string) => void | Promise<void>;
  toolbarLeading?: ReactNode;
  toolbarTrailing?: ReactNode;
  renderLeadingActions?: (item: FileBrowserItem) => ReactNode;
  renderTrailingActions?: (item: FileBrowserItem) => ReactNode;
  children: (props: FileBrowserActionsPanelRenderProps) => ReactNode;
}

export function FileBrowserActionsPanel({
  disabled = false,
  locale,
  onDownload,
  onRename,
  onDelete,
  onCreateFolder,
  onCreateFile,
  toolbarLeading,
  toolbarTrailing,
  renderLeadingActions,
  renderTrailingActions,
  children,
}: FileBrowserActionsPanelProps) {
  const labels = useFileBrowserLocale(locale);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFolderName, setCreateFolderName] = useState("");
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFileName, setCreateFileName] = useState("");
  const [renameItem, setRenameItem] = useState<FileBrowserItem | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteItem, setDeleteItem] = useState<FileBrowserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const closeCreateFolder = useCallback(() => {
    setCreateFolderOpen(false);
    setCreateFolderName("");
  }, []);

  const closeCreateFile = useCallback(() => {
    setCreateFileOpen(false);
    setCreateFileName("");
  }, []);

  const closeRename = useCallback(() => {
    setRenameItem(null);
    setRenameName("");
  }, []);

  const handleCreateFolder = useCallback(async () => {
    const trimmed = createFolderName.trim();
    if (!trimmed || !isSafePathSegment(trimmed) || !onCreateFolder || actionLoading) {
      return;
    }

    setActionLoading(true);
    try {
      await onCreateFolder(trimmed);
      closeCreateFolder();
    } catch {
      // Keep modal open; host handlers show the error toast.
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, closeCreateFolder, createFolderName, onCreateFolder]);

  const handleCreateFile = useCallback(async () => {
    const trimmed = createFileName.trim();
    if (!trimmed || !isSafePathSegment(trimmed) || !onCreateFile || actionLoading) {
      return;
    }

    setActionLoading(true);
    try {
      await onCreateFile(trimmed);
      closeCreateFile();
    } catch {
      // Keep modal open; host handlers show the error toast.
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, closeCreateFile, createFileName, onCreateFile]);

  const handleRenameConfirm = useCallback(async () => {
    const trimmed = renameName.trim();
    if (
      !renameItem ||
      !onRename ||
      !trimmed ||
      !isSafePathSegment(trimmed) ||
      trimmed === renameItem.name ||
      actionLoading
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await onRename(renameItem, trimmed);
      closeRename();
    } catch {
      // Keep modal open; host handlers show the error toast.
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, closeRename, onRename, renameItem, renameName]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteItem || !onDelete || actionLoading) {
      return;
    }

    setActionLoading(true);
    try {
      await onDelete(deleteItem);
      setDeleteItem(null);
    } catch {
      // Keep modal open; host handlers show the error toast.
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, deleteItem, onDelete]);

  const renderRowActions = useCallback(
    (item: FileBrowserItem) => (
      <FileBrowserRowActions
        isDirectory={item.kind === "directory"}
        disabled={disabled || actionLoading}
        downloadTitle={labels.actions.download}
        renameTitle={labels.actions.rename}
        deleteTitle={labels.actions.delete}
        onDownload={onDownload ? () => onDownload(item) : undefined}
        onRename={
          onRename
            ? () => {
                if (disabled || actionLoading) {
                  return;
                }
                setRenameItem(item);
                setRenameName(item.name);
              }
            : undefined
        }
        onDelete={
          onDelete
            ? () => {
                if (disabled || actionLoading) {
                  return;
                }
                setDeleteItem(item);
              }
            : undefined
        }
        leadingActions={renderLeadingActions?.(item)}
        trailingActions={renderTrailingActions?.(item)}
      />
    ),
    [
      actionLoading,
      disabled,
      labels.actions.delete,
      labels.actions.download,
      labels.actions.rename,
      onDelete,
      onDownload,
      onRename,
      renderLeadingActions,
      renderTrailingActions,
    ]
  );

  const toolbarLocked = disabled || actionLoading;

  const toolbar = (
    <div
      className={`${styles.actionButtons}${toolbarLocked ? ` ${styles.actionButtonsLocked}` : ""}`}
    >
      {toolbarLeading}

      {onCreateFolder && (
        <Button
          icon={<MatIcon icon="create_new_folder" size="small" />}
          aria-disabled={toolbarLocked || undefined}
          tabIndex={toolbarLocked ? -1 : undefined}
          onClick={() => {
            if (toolbarLocked) {
              return;
            }
            setCreateFolderOpen(true);
          }}
        >
          {labels.actions.createFolder}
        </Button>
      )}

      {onCreateFile && (
        <Button
          icon={<MatIcon icon="note_add" size="small" />}
          aria-disabled={toolbarLocked || undefined}
          tabIndex={toolbarLocked ? -1 : undefined}
          onClick={() => {
            if (toolbarLocked) {
              return;
            }
            setCreateFileOpen(true);
          }}
        >
          {labels.actions.createFile}
        </Button>
      )}

      {toolbarTrailing}
    </div>
  );

  return (
    <>
      {children({ toolbar, renderRowActions })}

      {onCreateFolder && (
        <FileBrowserNameModal
          open={createFolderOpen}
          title={labels.actions.createFolder}
          value={createFolderName}
          placeholder={labels.actions.folderNamePlaceholder}
          okText={labels.actions.create}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          confirmLoading={actionLoading}
          onChange={setCreateFolderName}
          onConfirm={handleCreateFolder}
          onCancel={closeCreateFolder}
        />
      )}

      {onCreateFile && (
        <FileBrowserNameModal
          open={createFileOpen}
          title={labels.actions.createFile}
          value={createFileName}
          placeholder={labels.actions.fileNamePlaceholder}
          okText={labels.actions.create}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          confirmLoading={actionLoading}
          onChange={setCreateFileName}
          onConfirm={handleCreateFile}
          onCancel={closeCreateFile}
        />
      )}

      {onRename && (
        <FileBrowserNameModal
          open={renameItem != null}
          title={labels.actions.rename}
          value={renameName}
          placeholder={labels.actions.newNamePlaceholder}
          okText={labels.actions.rename}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          confirmDisabled={
            !renameName.trim() ||
            !isSafePathSegment(renameName) ||
            renameName.trim() === renameItem?.name
          }
          confirmLoading={actionLoading}
          onChange={setRenameName}
          onConfirm={handleRenameConfirm}
          onCancel={closeRename}
        />
      )}

      {onDelete && (
        <FileBrowserDeleteConfirmModal
          open={deleteItem != null}
          itemName={deleteItem?.name}
          locale={locale}
          confirmLoading={actionLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            if (!actionLoading) {
              setDeleteItem(null);
            }
          }}
        />
      )}
    </>
  );
}
