import { Button } from "antd";
import { type ReactNode, useCallback, useRef, useState } from "react";

import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isFileBrowserSafePathSegment } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";
import { getSubmitErrorMessage } from "../utils/get-submit-error-message";

import { FileBrowserDeleteConfirmModal } from "./file-browser-delete-confirm-modal";
import { FileBrowserNameModal } from "./file-browser-name-modal";
import { FileBrowserRowActions } from "./file-browser-row-actions";
import styles from "./file-browser.module.css";

type ActiveModal = "create-folder" | "create-file" | "rename" | "delete" | null;

export interface FileBrowserActionsPanelRenderProps {
  toolbar: ReactNode;
  renderRowActions: (item: FileBrowserItem) => ReactNode;
}

export interface FileBrowserActionsPanelProps {
  disabled?: boolean;
  locale?: FileBrowserLocaleOverrides;
  isValidName?: (name: string) => boolean;
  onDownload?: (item: FileBrowserItem) => void | Promise<void>;
  onRename?: (item: FileBrowserItem, newName: string) => void | Promise<void>;
  onDelete?: (item: FileBrowserItem) => void | Promise<void>;
  onCreateFolder?: (name: string) => void | Promise<void>;
  onCreateFile?: (name: string) => void | Promise<void>;
  onSubmitError?: (message: string) => void;
  toolbarLeading?: ReactNode;
  toolbarTrailing?: ReactNode;
  renderLeadingActions?: (item: FileBrowserItem) => ReactNode;
  renderTrailingActions?: (item: FileBrowserItem) => ReactNode;
  children: (props: FileBrowserActionsPanelRenderProps) => ReactNode;
}

export function FileBrowserActionsPanel({
  disabled = false,
  locale,
  isValidName = isFileBrowserSafePathSegment,
  onDownload,
  onRename,
  onDelete,
  onCreateFolder,
  onCreateFile,
  onSubmitError,
  toolbarLeading,
  toolbarTrailing,
  renderLeadingActions,
  renderTrailingActions,
  children,
}: FileBrowserActionsPanelProps) {
  const labels = useFileBrowserLocale(locale);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [createFolderName, setCreateFolderName] = useState("");
  const [createFileName, setCreateFileName] = useState("");
  const [renameItem, setRenameItem] = useState<FileBrowserItem | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteItem, setDeleteItem] = useState<FileBrowserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [nameSubmitError, setNameSubmitError] = useState<string | null>(null);
  const actionLockRef = useRef(false);
  const activeModalRef = useRef<ActiveModal>(null);
  activeModalRef.current = activeModal;

  const clearNameSubmitError = useCallback(() => {
    setNameSubmitError(null);
  }, []);

  const reportNameSubmitError = useCallback(
    (modal: Exclude<ActiveModal, null>, error: unknown) => {
      const message = getSubmitErrorMessage(error);
      if (message == null) {
        return;
      }
      if (activeModalRef.current === modal) {
        setNameSubmitError(message);
        return;
      }
      onSubmitError?.(message);
    },
    [onSubmitError]
  );

  const closeActiveModal = useCallback(() => {
    setNameSubmitError(null);
    setActiveModal(null);
  }, []);

  const openModal = useCallback((modal: Exclude<ActiveModal, null>) => {
    setNameSubmitError(null);
    if (modal === "create-folder") {
      setCreateFolderName("");
    }
    if (modal === "create-file") {
      setCreateFileName("");
    }
    setActiveModal(modal);
  }, []);

  const clearCreateFolderDraft = useCallback(() => {
    if (activeModalRef.current === "create-folder") {
      return;
    }
    setCreateFolderName("");
    if (activeModalRef.current == null) {
      setNameSubmitError(null);
    }
  }, []);

  const clearCreateFileDraft = useCallback(() => {
    if (activeModalRef.current === "create-file") {
      return;
    }
    setCreateFileName("");
    if (activeModalRef.current == null) {
      setNameSubmitError(null);
    }
  }, []);

  const clearRenameDraft = useCallback(() => {
    if (activeModalRef.current === "rename") {
      return;
    }
    setRenameItem(null);
    setRenameName("");
    if (activeModalRef.current == null) {
      setNameSubmitError(null);
    }
  }, []);

  const clearDeleteDraft = useCallback(() => {
    if (activeModalRef.current === "delete") {
      return;
    }
    setDeleteItem(null);
  }, []);

  const runLockedAction = useCallback(async (action: () => Promise<void>) => {
    if (actionLockRef.current) {
      return;
    }
    actionLockRef.current = true;
    setActionLoading(true);
    try {
      await action();
    } finally {
      actionLockRef.current = false;
      setActionLoading(false);
    }
  }, []);

  const handleCreateFolder = useCallback(async () => {
    const trimmed = createFolderName.trim();
    if (!trimmed || !isValidName(trimmed) || !onCreateFolder) {
      return;
    }

    await runLockedAction(async () => {
      setNameSubmitError(null);
      try {
        await onCreateFolder(trimmed);
        setActiveModal(null);
      } catch (error) {
        reportNameSubmitError("create-folder", error);
      }
    });
  }, [createFolderName, isValidName, onCreateFolder, reportNameSubmitError, runLockedAction]);

  const handleCreateFile = useCallback(async () => {
    const trimmed = createFileName.trim();
    if (!trimmed || !isValidName(trimmed) || !onCreateFile) {
      return;
    }

    await runLockedAction(async () => {
      setNameSubmitError(null);
      try {
        await onCreateFile(trimmed);
        setActiveModal(null);
      } catch (error) {
        reportNameSubmitError("create-file", error);
      }
    });
  }, [createFileName, isValidName, onCreateFile, reportNameSubmitError, runLockedAction]);

  const handleRenameConfirm = useCallback(async () => {
    const trimmed = renameName.trim();
    if (
      !renameItem ||
      !onRename ||
      !trimmed ||
      !isValidName(trimmed) ||
      trimmed === renameItem.name
    ) {
      return;
    }

    await runLockedAction(async () => {
      setNameSubmitError(null);
      try {
        await onRename(renameItem, trimmed);
        setActiveModal(null);
      } catch (error) {
        reportNameSubmitError("rename", error);
      }
    });
  }, [isValidName, onRename, renameItem, renameName, reportNameSubmitError, runLockedAction]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteItem || !onDelete) {
      return;
    }

    await runLockedAction(async () => {
      try {
        await onDelete(deleteItem);
        setActiveModal(null);
      } catch (error) {
        const message = getSubmitErrorMessage(error);
        if (message == null) {
          return;
        }
        onSubmitError?.(message);
      }
    });
  }, [deleteItem, onDelete, onSubmitError, runLockedAction]);

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
                openModal("rename");
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
                openModal("delete");
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
      openModal,
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
            openModal("create-folder");
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
            openModal("create-file");
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
          open={activeModal === "create-folder"}
          title={labels.actions.createFolder}
          value={createFolderName}
          placeholder={labels.actions.folderNamePlaceholder}
          okText={labels.actions.create}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          submitError={activeModal === "create-folder" ? nameSubmitError : null}
          okLoading={actionLoading}
          isValidName={isValidName}
          onChange={setCreateFolderName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleCreateFolder}
          onCancel={closeActiveModal}
          afterClose={clearCreateFolderDraft}
        />
      )}

      {onCreateFile && (
        <FileBrowserNameModal
          open={activeModal === "create-file"}
          title={labels.actions.createFile}
          value={createFileName}
          placeholder={labels.actions.fileNamePlaceholder}
          okText={labels.actions.create}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          submitError={activeModal === "create-file" ? nameSubmitError : null}
          okLoading={actionLoading}
          isValidName={isValidName}
          onChange={setCreateFileName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleCreateFile}
          onCancel={closeActiveModal}
          afterClose={clearCreateFileDraft}
        />
      )}

      {onRename && renameItem != null && (
        <FileBrowserNameModal
          open={activeModal === "rename"}
          title={labels.actions.rename}
          value={renameName}
          placeholder={labels.actions.newNamePlaceholder}
          okText={labels.actions.rename}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          invalidNameMessage={labels.nameModal.nameInvalid}
          submitError={activeModal === "rename" ? nameSubmitError : null}
          confirmDisabled={
            !renameName.trim() ||
            !isValidName(renameName.trim()) ||
            renameName.trim() === renameItem.name
          }
          okLoading={actionLoading}
          isValidName={isValidName}
          onChange={setRenameName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleRenameConfirm}
          onCancel={closeActiveModal}
          afterClose={clearRenameDraft}
        />
      )}

      {onDelete && deleteItem != null && (
        <FileBrowserDeleteConfirmModal
          open={activeModal === "delete"}
          itemName={deleteItem.name}
          itemPath={deleteItem.path}
          itemKind={deleteItem.kind}
          locale={locale}
          okLoading={actionLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={closeActiveModal}
          afterClose={clearDeleteDraft}
        />
      )}
    </>
  );
}
