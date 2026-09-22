import { DeleteOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RefreshButton } from "../../buttons/refresh-button";
import type { CellAction } from "../../fast-table/types";
import { MatIcon } from "../../mat-icon/mat-icon";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import { isFileBrowserSafePathSegment } from "../model/path-utils";
import type { FileBrowserItem, FileBrowserLocaleOverrides } from "../model/types";
import type { SubmitAppErrorPayload } from "../utils/get-submit-error-message";
import { reportFileBrowserSubmitError } from "../utils/report-file-browser-submit-error";

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
  downloadDisabled?: boolean;
  locale?: FileBrowserLocaleOverrides;
  isValidName?: (name: string) => boolean;
  isForbiddenName?: (name: string) => boolean;
  onDownload?: (item: FileBrowserItem) => void | Promise<void>;
  isDownloadDisabled?: (item: FileBrowserItem) => boolean;
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
  downloadDisabled = false,
  locale,
  isValidName = isFileBrowserSafePathSegment,
  isForbiddenName,
  onDownload,
  isDownloadDisabled,
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
  const [nameMutationError, setNameMutationError] = useState<SubmitAppErrorPayload | null>(null);
  const [deleteMutationError, setDeleteMutationError] = useState<SubmitAppErrorPayload | null>(
    null
  );
  const [deleteSubmitError, setDeleteSubmitError] = useState<string | null>(null);
  const actionLockRef = useRef(false);
  const reloadLockRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeModalRef = useRef<ActiveModal>(null);
  activeModalRef.current = activeModal;

  const onDownloadRef = useRef(onDownload);
  onDownloadRef.current = onDownload;
  const isDownloadDisabledRef = useRef(isDownloadDisabled);
  isDownloadDisabledRef.current = isDownloadDisabled;
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
  const downloadDisabledRef = useRef(downloadDisabled);
  downloadDisabledRef.current = downloadDisabled;
  const actionLoadingRef = useRef(actionLoading);
  actionLoadingRef.current = actionLoading;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearNameErrors = useCallback(() => {
    setNameSubmitError(null);
    setNameMutationError(null);
  }, []);

  const clearDeleteErrors = useCallback(() => {
    setDeleteMutationError(null);
    setDeleteSubmitError(null);
  }, []);

  const reportNameSubmitError = useCallback(
    (modal: Exclude<ActiveModal, null>, error: unknown) => {
      reportFileBrowserSubmitError(error, {
        modalOpen: activeModalRef.current === modal,
        onModalAppError: (payload) => {
          setNameSubmitError(null);
          setNameMutationError(payload);
        },
        onModalMessage: (message) => {
          setNameMutationError(null);
          setNameSubmitError(message);
        },
        onClosedMessage: onSubmitError,
      });
    },
    [onSubmitError]
  );

  const closeActiveModal = useCallback(() => {
    clearNameErrors();
    clearDeleteErrors();
    setActiveModal(null);
  }, [clearDeleteErrors, clearNameErrors]);

  const openModal = useCallback(
    (modal: Exclude<ActiveModal, null>) => {
      clearNameErrors();
      clearDeleteErrors();
      if (modal === "create-folder") {
        setCreateFolderName("");
      }
      if (modal === "create-file") {
        setCreateFileName("");
      }
      setActiveModal(modal);
    },
    [clearDeleteErrors, clearNameErrors]
  );

  const clearNameModalDraft = useCallback(
    (modal: ActiveModal, clear: () => void) => {
      if (activeModalRef.current === modal) {
        return;
      }
      clear();
      if (activeModalRef.current == null) {
        clearNameErrors();
      }
    },
    [clearNameErrors]
  );

  const clearDeleteDraft = useCallback(() => {
    if (activeModalRef.current === "delete") {
      return;
    }
    setDeleteItem(null);
    clearDeleteErrors();
  }, [clearDeleteErrors]);

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
        clearNameErrors();
        try {
          await action();
          setActiveModal(null);
        } catch (error) {
          reportNameSubmitError(modal, error);
        }
      });
    },
    [clearNameErrors, reportNameSubmitError, runLockedAction]
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
      clearDeleteErrors();
      try {
        await onDelete(deleteItem);
        setActiveModal(null);
      } catch (error) {
        reportFileBrowserSubmitError(error, {
          modalOpen: activeModalRef.current === "delete",
          onModalAppError: (payload) => {
            setDeleteMutationError(payload);
          },
          onModalMessage: (message) => {
            setDeleteSubmitError(message);
          },
          onClosedMessage: onSubmitError,
        });
      }
    });
  }, [clearDeleteErrors, deleteItem, onDelete, onSubmitError, runLockedAction]);

  const rowActions = useMemo(() => {
    const isLocked = () => disabledRef.current || actionLoadingRef.current;
    const actions: CellAction<FileBrowserItem>[] = [];

    if (onDownload) {
      actions.push({
        icon: <DownloadOutlined />,
        title: labels.actions.download,
        visible: (_value, row) => row.kind !== "directory",
        disabled: (_value, row) => {
          const transferDisabled = isDownloadDisabledRef.current?.(row) === true;
          return (
            isLocked() ||
            row.kind === "directory" ||
            downloadDisabledRef.current ||
            transferDisabled
          );
        },
        onClick: (_value, row) => {
          if (
            isLocked() ||
            row.kind === "directory" ||
            downloadDisabledRef.current ||
            isDownloadDisabledRef.current?.(row) === true
          ) {
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
        disabled: (_value, row) => {
          const allowed = canRenameRef.current?.(row) ?? true;
          const transferLocked = isDownloadDisabledRef.current?.(row) === true;
          return isLocked() || !allowed || transferLocked;
        },
        onClick: (_value, row) => {
          if (
            isLocked() ||
            !(canRenameRef.current?.(row) ?? true) ||
            isDownloadDisabledRef.current?.(row) === true
          ) {
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
        disabled: (_value, row) => {
          const allowed = canDeleteRef.current?.(row) ?? true;
          const transferLocked = isDownloadDisabledRef.current?.(row) === true;
          return isLocked() || !allowed || transferLocked;
        },
        buttonProps: { color: "danger" },
        onClick: (_value, row) => {
          if (
            isLocked() ||
            !(canDeleteRef.current?.(row) ?? true) ||
            isDownloadDisabledRef.current?.(row) === true
          ) {
            return;
          }
          setDeleteItem(row);
          openModal("delete");
        },
      });
    }

    return [...(leadingRowActions ?? []), ...actions, ...(trailingRowActions ?? [])];
  }, [
    actionLoading,
    disabled,
    downloadDisabled,
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
          mutationError={activeModal === "create-folder" ? nameMutationError?.error : null}
          mutationErrorFallback={nameMutationError?.fallback}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setCreateFolderName}
          onClearSubmitError={clearNameErrors}
          onClearMutationError={clearNameErrors}
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
          mutationError={activeModal === "create-file" ? nameMutationError?.error : null}
          mutationErrorFallback={nameMutationError?.fallback}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setCreateFileName}
          onClearSubmitError={clearNameErrors}
          onClearMutationError={clearNameErrors}
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
          mutationError={activeModal === "rename" ? nameMutationError?.error : null}
          mutationErrorFallback={nameMutationError?.fallback}
          confirmDisabled={renameName.trim() === renameItem.name}
          okLoading={actionLoading}
          isValidName={isValidName}
          getInvalidNameMessage={resolveInvalidNameMessage}
          onChange={setRenameName}
          onClearSubmitError={clearNameErrors}
          onClearMutationError={clearNameErrors}
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
          submitError={activeModal === "delete" ? deleteSubmitError : null}
          mutationError={activeModal === "delete" ? deleteMutationError?.error : null}
          mutationErrorFallback={deleteMutationError?.fallback}
          onClearSubmitError={clearDeleteErrors}
          onClearMutationError={clearDeleteErrors}
          onConfirm={handleDeleteConfirm}
          onCancel={closeActiveModal}
          afterClose={clearDeleteDraft}
        />
      )}
    </>
  );
}
