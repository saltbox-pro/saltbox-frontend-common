import { DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RefreshButton } from "../../buttons/refresh-button";
import type { CellAction } from "../../fast-table/types";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isFileBrowserSafePathSegment } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";
import { getSubmitErrorMessage } from "../utils/get-submit-error-message";

import { FileBrowserDeleteConfirmModal } from "./file-browser-delete-confirm-modal";
import { FileBrowserNameModal } from "./file-browser-name-modal";
import styles from "./file-browser.module.css";

type ActiveModal = "create-folder" | "create-file" | "rename" | "delete" | null;

export interface FileBrowserActionsPanelRenderProps {
  toolbar: ReactNode;
  rowActions: CellAction<FileBrowserItem>[];
}

export interface FileBrowserActionsPanelProps {
  disabled?: boolean;
  locale?: FileBrowserLocaleOverrides;
  isValidName?: (name: string) => boolean;
  isForbiddenName?: (name: string) => boolean;
  onDownload?: (item: FileBrowserItem) => void | Promise<void>;
  onRename?: (item: FileBrowserItem, newName: string) => void | Promise<void>;
  onDelete?: (item: FileBrowserItem) => void | Promise<void>;
  canRename?: (item: FileBrowserItem) => boolean;
  canDelete?: (item: FileBrowserItem) => boolean;
  onCreateFolder?: (name: string) => void | Promise<void>;
  onCreateFile?: (name: string) => void | Promise<void>;
  createActionsAppearance?: "label" | "icon";
  onReload?: () => void | Promise<void>;
  onSubmitError?: (message: string) => void;
  toolbarLeading?: ReactNode;
  toolbarTrailing?: ReactNode;
  leadingRowActions?: CellAction<FileBrowserItem>[];
  trailingRowActions?: CellAction<FileBrowserItem>[];
  children: (props: FileBrowserActionsPanelRenderProps) => ReactNode;
}

export function FileBrowserActionsPanel({
  disabled = false,
  locale,
  isValidName = isFileBrowserSafePathSegment,
  isForbiddenName,
  onDownload,
  onRename,
  onDelete,
  canRename,
  canDelete,
  onCreateFolder,
  onCreateFile,
  createActionsAppearance = "label",
  onReload,
  onSubmitError,
  toolbarLeading,
  toolbarTrailing,
  leadingRowActions,
  trailingRowActions,
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
  const [isReloading, setIsReloading] = useState(false);
  const [nameSubmitError, setNameSubmitError] = useState<string | null>(null);
  const actionLockRef = useRef(false);
  const reloadLockRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeModalRef = useRef<ActiveModal>(null);
  activeModalRef.current = activeModal;

  const onDownloadRef = useRef(onDownload);
  onDownloadRef.current = onDownload;
  const onRenameRef = useRef(onRename);
  onRenameRef.current = onRename;
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;
  const canRenameRef = useRef(canRename);
  canRenameRef.current = canRename;
  const canDeleteRef = useRef(canDelete);
  canDeleteRef.current = canDelete;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const actionLoadingRef = useRef(actionLoading);
  actionLoadingRef.current = actionLoading;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const clearNameModalDraft = useCallback((modal: ActiveModal, clear: () => void) => {
    if (activeModalRef.current === modal) {
      return;
    }
    clear();
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

  const runNameAction = useCallback(
    async (modal: "create-folder" | "create-file" | "rename", action: () => Promise<void>) => {
      await runLockedAction(async () => {
        setNameSubmitError(null);
        try {
          await action();
          setActiveModal(null);
        } catch (error) {
          reportNameSubmitError(modal, error);
        }
      });
    },
    [reportNameSubmitError, runLockedAction]
  );

  const handleCreateFolder = useCallback(
    async (name: string) => {
      if (!onCreateFolder) {
        return;
      }
      await runNameAction("create-folder", async () => onCreateFolder(name));
    },
    [onCreateFolder, runNameAction]
  );

  const handleCreateFile = useCallback(
    async (name: string) => {
      if (!onCreateFile) {
        return;
      }
      await runNameAction("create-file", async () => onCreateFile(name));
    },
    [onCreateFile, runNameAction]
  );

  const handleRenameConfirm = useCallback(
    async (name: string) => {
      if (!renameItem || !onRename || name === renameItem.name) {
        return;
      }
      await runNameAction("rename", async () => onRename(renameItem, name));
    },
    [onRename, renameItem, runNameAction]
  );

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

  const rowActions = useMemo(() => {
    const actions: CellAction<FileBrowserItem>[] = [];
    const isLocked = () => disabledRef.current || actionLoadingRef.current;

    if (onDownload) {
      actions.push({
        icon: <DownloadOutlined />,
        title: labels.actions.download,
        disabled: (_value, row) => row.kind === "directory" || isLocked(),
        onClick: (_value, row) => {
          if (row.kind === "directory" || isLocked()) {
            return;
          }
          onDownloadRef.current?.(row);
        },
      });
    }

    if (onRename) {
      actions.push({
        icon: <EditOutlined />,
        title: labels.actions.rename,
        visible: (_value, row) => canRenameRef.current?.(row) ?? true,
        disabled: () => isLocked(),
        onClick: (_value, row) => {
          if (isLocked() || !(canRenameRef.current?.(row) ?? true)) {
            return;
          }
          setRenameItem(row);
          setRenameName(row.name);
          openModal("rename");
        },
      });
    }

    if (onDelete) {
      actions.push({
        icon: <DeleteOutlined />,
        title: labels.actions.delete,
        visible: (_value, row) => canDeleteRef.current?.(row) ?? true,
        disabled: () => isLocked(),
        buttonProps: { color: "danger" },
        onClick: (_value, row) => {
          if (isLocked() || !(canDeleteRef.current?.(row) ?? true)) {
            return;
          }
          setDeleteItem(row);
          openModal("delete");
        },
      });
    }

    return [...(leadingRowActions ?? []), ...actions, ...(trailingRowActions ?? [])];
  }, [
    labels.actions.delete,
    labels.actions.download,
    labels.actions.rename,
    leadingRowActions,
    onDelete,
    onDownload,
    onRename,
    openModal,
    trailingRowActions,
  ]);

  const toolbarLocked = disabled || actionLoading;

  const handleReload = useCallback(async () => {
    if (onReload == null || toolbarLocked || reloadLockRef.current) {
      return;
    }

    reloadLockRef.current = true;
    setIsReloading(true);
    try {
      await onReload();
    } catch {
    } finally {
      reloadLockRef.current = false;
      if (isMountedRef.current) {
        setIsReloading(false);
      }
    }
  }, [onReload, toolbarLocked]);

  const openToolbarModal = (modal: Exclude<ActiveModal, null>) => {
    if (toolbarLocked) {
      return;
    }
    openModal(modal);
  };

  const resolveInvalidNameMessage = (name: string) =>
    isForbiddenName?.(name) ? labels.nameModal.nameForbidden : labels.nameModal.nameInvalid;

  const toolbar = (
    <div className={styles.actionButtons}>
      {toolbarLeading}
      <div
        className={`${styles.actionButtonsGroup}${toolbarLocked ? ` ${styles.actionButtonsLocked}` : ""}`}
      >
        {onReload && (
          <RefreshButton
            loading={isReloading}
            aria-disabled={toolbarLocked || undefined}
            tabIndex={toolbarLocked ? -1 : undefined}
            onClick={handleReload}
          />
        )}

        {onCreateFolder && (
          <Button
            icon={<MatIcon icon="create_new_folder" size="small" />}
            title={createActionsAppearance === "icon" ? labels.actions.createFolder : undefined}
            aria-label={labels.actions.createFolder}
            aria-disabled={toolbarLocked || undefined}
            tabIndex={toolbarLocked ? -1 : undefined}
            onClick={() => openToolbarModal("create-folder")}
          >
            {createActionsAppearance !== "icon" && labels.actions.createFolder}
          </Button>
        )}

        {onCreateFile && (
          <Button
            icon={<MatIcon icon="note_add" size="small" />}
            title={createActionsAppearance === "icon" ? labels.actions.createFile : undefined}
            aria-label={labels.actions.createFile}
            aria-disabled={toolbarLocked || undefined}
            tabIndex={toolbarLocked ? -1 : undefined}
            onClick={() => openToolbarModal("create-file")}
          >
            {createActionsAppearance !== "icon" && labels.actions.createFile}
          </Button>
        )}
      </div>
      {toolbarTrailing}
    </div>
  );

  return (
    <>
      {children({ toolbar, rowActions })}

      {onCreateFolder && (
        <FileBrowserNameModal
          open={activeModal === "create-folder"}
          title={labels.actions.createFolder}
          value={createFolderName}
          placeholder={labels.actions.folderNamePlaceholder}
          okText={labels.actions.create}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.directoryNameRequired}
          submitError={activeModal === "create-folder" ? nameSubmitError : null}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setCreateFolderName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleCreateFolder}
          onCancel={closeActiveModal}
          afterClose={() => clearNameModalDraft("create-folder", () => setCreateFolderName(""))}
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
          requiredMessage={labels.nameModal.fileNameRequired}
          submitError={activeModal === "create-file" ? nameSubmitError : null}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setCreateFileName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleCreateFile}
          onCancel={closeActiveModal}
          afterClose={() => clearNameModalDraft("create-file", () => setCreateFileName(""))}
        />
      )}

      {onRename && renameItem != null && (
        <FileBrowserNameModal
          open={activeModal === "rename"}
          title={
            renameItem.kind === "directory"
              ? labels.actions.renameTitleDirectory
              : labels.actions.renameTitleFile
          }
          value={renameName}
          placeholder={labels.actions.newNamePlaceholder}
          okText={labels.actions.rename}
          cancelText={labels.actions.cancel}
          requiredMessage={labels.nameModal.nameRequired}
          submitError={activeModal === "rename" ? nameSubmitError : null}
          confirmDisabled={renameName.trim() === renameItem.name}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setRenameName}
          onClearSubmitError={clearNameSubmitError}
          onConfirm={handleRenameConfirm}
          onCancel={closeActiveModal}
          afterClose={() =>
            clearNameModalDraft("rename", () => {
              setRenameItem(null);
              setRenameName("");
            })
          }
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
