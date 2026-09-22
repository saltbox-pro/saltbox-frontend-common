import { EditOutlined, LockOutlined } from "@ant-design/icons";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Alert, Button, Empty, Flex, Skeleton, Tag, Tooltip } from "antd";
import type { editor } from "monaco-editor";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorZone, type LoadSource } from "../../../error-handling";
import { Modal } from "../../antd-wrappers/modal";
import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type {
  ShowFileBrowserErrorByCode,
  ShowFileBrowserSuccessByKey,
} from "../hooks/use-file-browser-notification-toasts";
import type { FileBrowserLocaleOverrides } from "../model/types";
import { getMonacoLanguage } from "../utils/language-utils";

import styles from "./file-browser-content-modal.module.css";
import { FileBrowserCopyPathButton } from "./file-browser-copy-path-button";

type EditorOptions = editor.IStandaloneEditorConstructionOptions;

const EDITOR_OPTIONS: EditorOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  lineNumbers: "on",
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
};

export interface FileBrowserContentModalConflictActions {
  onRefreshFromFile: () => void;
  onKeepCurrentChanges?: () => void;
}

export interface FileBrowserContentModalProps {
  open: boolean;
  fileName: string;
  filePath?: string;
  pathCopyPrefix?: string;
  pathCopyTitle?: string;
  showSuccessByKey?: ShowFileBrowserSuccessByKey;
  showErrorByCode?: ShowFileBrowserErrorByCode;
  language?: string;
  content: string;
  loading?: boolean;
  empty?: boolean;
  error?: ReactNode;
  loaders?: readonly LoadSource[];
  editorError?: ReactNode;
  isRefreshing?: boolean;
  conflictActions?: FileBrowserContentModalConflictActions;
  readOnly?: boolean;
  canEdit?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  saveDisabled?: boolean;
  locale?: FileBrowserLocaleOverrides;
  headerExtra?: ReactNode;
  onChange?: (value: string) => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: () => void | Promise<void>;
  onClose: () => void;
}

export function FileBrowserContentModal({
  open,
  fileName,
  filePath,
  pathCopyPrefix,
  pathCopyTitle,
  showSuccessByKey,
  showErrorByCode,
  language,
  content,
  loading = false,
  empty = false,
  error,
  loaders,
  editorError,
  isRefreshing = false,
  conflictActions,
  readOnly = false,
  canEdit = false,
  isDirty = false,
  isSaving = false,
  saveDisabled = false,
  locale,
  headerExtra,
  onChange,
  onEdit,
  onCancelEdit,
  onSave,
  onClose,
}: FileBrowserContentModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const [unsavedConfirmOpen, setUnsavedConfirmOpen] = useState(false);
  const [savingConfirmOpen, setSavingConfirmOpen] = useState(false);
  const resolvedLanguage = language ?? getMonacoLanguage(fileName);
  const hasBlockingLoadError =
    error != null ||
    (loaders?.some((loader) => loader.error != null && loader.isInitialLoad) ?? false);
  const showContentCopy = !loading && !hasBlockingLoadError && !empty && content.length > 0;

  const saveShortcutRef = useRef({
    readOnly,
    isDirty,
    isSaving,
    saveDisabled,
    loading,
    hasError: hasBlockingLoadError,
    onSave,
  });
  saveShortcutRef.current = {
    readOnly,
    isDirty,
    isSaving,
    saveDisabled,
    loading,
    hasError: hasBlockingLoadError,
    onSave,
  };

  useEffect(() => {
    if (!open) {
      setUnsavedConfirmOpen(false);
      setSavingConfirmOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isSaving) {
      setSavingConfirmOpen(false);
    }
  }, [isSaving]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (readOnly) {
        return;
      }
      onChange?.(value ?? "");
    },
    [onChange, readOnly]
  );

  const handleClose = useCallback(() => {
    if (isSaving) {
      setSavingConfirmOpen(true);
      return;
    }
    if (!readOnly && isDirty) {
      setUnsavedConfirmOpen(true);
      return;
    }
    onClose();
  }, [isDirty, isSaving, onClose, readOnly]);

  const handleDiscard = useCallback(() => {
    setUnsavedConfirmOpen(false);
    onClose();
  }, [onClose]);

  const handleCancelEdit = useCallback(() => {
    if (isSaving || loading) {
      return;
    }
    (onCancelEdit ?? onClose)();
  }, [isSaving, loading, onCancelEdit, onClose]);

  const handleCloseWhileSaving = useCallback(() => {
    setSavingConfirmOpen(false);
    onClose();
  }, [onClose]);

  const handleEditorMount = useCallback<OnMount>((editorInstance, monacoApi) => {
    editorInstance.addCommand(monacoApi.KeyMod.CtrlCmd | monacoApi.KeyCode.KeyS, () => {
      const state = saveShortcutRef.current;
      if (
        state.readOnly ||
        !state.isDirty ||
        state.isSaving ||
        state.saveDisabled ||
        state.loading ||
        state.hasError
      ) {
        return;
      }
      Promise.resolve(state.onSave?.()).catch(() => undefined);
    });
  }, []);

  const options = useMemo(
    () => ({
      ...EDITOR_OPTIONS,
      readOnly: readOnly || isSaving,
      contextmenu: !readOnly,
      renderLineHighlight: readOnly ? ("none" as const) : ("line" as const),
      selectionHighlight: !readOnly,
    }),
    [isSaving, readOnly]
  );

  const title = (
    <Flex vertical gap={4} className={styles.headerInfo}>
      <Flex align="center" gap="small" className={styles.headerTitleRow}>
        <span className={styles.headerFileName}>{fileName}</span>
        <Tag>{resolvedLanguage}</Tag>
        {readOnly && onEdit == null && (
          <Tag icon={<LockOutlined />}>{t("file-browser.content-modal.read-only")}</Tag>
        )}
        {headerExtra}
        {!readOnly && isDirty && (
          <span
            className={styles.dirtyIndicator}
            title={t("file-browser.content-modal.unsaved-changes")}
          />
        )}
      </Flex>
    </Flex>
  );

  const showEdit = onEdit != null && !hasBlockingLoadError;
  const showPathRow = (filePath != null && filePath.length > 0) || showEdit || showContentCopy;

  const pathRow = showPathRow ? (
    <Flex align="center" gap={4} className={styles.pathRow}>
      {filePath != null && filePath.length > 0 && (
        <>
          <div className={styles.pathText} title={filePath}>
            {filePath}
          </div>
          <FileBrowserCopyPathButton
            path={filePath}
            pathCopyPrefix={pathCopyPrefix}
            title={pathCopyTitle}
            locale={locale}
            showSuccessByKey={showSuccessByKey}
            showErrorByCode={showErrorByCode}
          />
        </>
      )}
      {(showContentCopy || showEdit) && (
        <Flex align="center" gap="small" className={styles.pathRowEnd}>
          {showContentCopy && (
            <CopyToClipboardButton
              text={content}
              size="middle"
              title={t("file-browser.content-modal.copy-content")}
            />
          )}
          {showEdit && (
            <Button
              icon={<EditOutlined />}
              onClick={onEdit}
              disabled={!readOnly || !canEdit || loading}
            >
              {t("file-browser.content-modal.edit")}
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  ) : null;

  const editorErrorMessage =
    editorError == null || conflictActions == null ? (
      editorError
    ) : (
      <Flex align="center" justify="space-between" gap="middle">
        <span>{editorError}</span>
        <Flex gap="small" flex="none">
          <Button
            size="small"
            loading={isRefreshing}
            onClick={() => {
              conflictActions.onRefreshFromFile();
            }}
          >
            {t(
              isDirty
                ? "file-browser.content-modal.refresh-take-disk"
                : "file-browser.content-modal.refresh-file"
            )}
          </Button>
          {isDirty && conflictActions.onKeepCurrentChanges != null && (
            <Tooltip title={t("file-browser.content-modal.refresh-keep-mine-hint")}>
              <Button
                size="small"
                loading={isRefreshing}
                onClick={() => {
                  conflictActions.onKeepCurrentChanges?.();
                }}
              >
                {t("file-browser.content-modal.refresh-keep-mine")}
              </Button>
            </Tooltip>
          )}
        </Flex>
      </Flex>
    );

  const bottomActions = (
    <Flex vertical gap="small" className={styles.bottomActions}>
      {editorErrorMessage != null &&
        (typeof editorErrorMessage === "string" || conflictActions != null ? (
          <Alert type="error" showIcon message={editorErrorMessage} />
        ) : (
          editorErrorMessage
        ))}
      <Flex justify="end" gap="small">
        <Button onClick={handleClose}>{t("file-browser.content-modal.close")}</Button>
        {!readOnly && (
          <>
            <Button onClick={handleCancelEdit} disabled={isSaving || loading}>
              {labels.actions.cancel}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                Promise.resolve(onSave?.()).catch(() => undefined);
              }}
              disabled={!isDirty || isSaving || saveDisabled || loading || hasBlockingLoadError}
              loading={isSaving}
            >
              {t("file-browser.content-modal.save")}
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );

  let bodyInner: ReactNode;
  if (loading) {
    bodyInner = (
      <Flex className={`${styles.fillContainer} ${styles.editorSkeleton}`}>
        <Skeleton active />
      </Flex>
    );
  } else if (error != null && (loaders == null || loaders.length === 0)) {
    bodyInner = (
      <Flex vertical className={styles.fillContainer}>
        <Alert type="error" showIcon message={error} />
      </Flex>
    );
  } else if (empty && readOnly) {
    bodyInner = (
      <Flex align="center" justify="center" className={styles.fillContainer}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("file-browser.content-modal.empty-file")}
        />
      </Flex>
    );
  } else {
    bodyInner = (
      <div
        className={`${styles.editorContainer}${readOnly ? ` ${styles.editorContainer_readOnly}` : ""}`}
      >
        <Editor
          height="100%"
          language={resolvedLanguage}
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={options}
        />
      </div>
    );
  }

  const bodyContent: ReactNode =
    loaders != null && loaders.length > 0 ? (
      <div className={styles.fillContainer}>
        <ErrorZone level="block" loaders={loaders}>
          {bodyInner}
        </ErrorZone>
      </div>
    ) : (
      bodyInner
    );

  return (
    <>
      <Modal
        open={open}
        title={title}
        footer={null}
        onCancel={handleClose}
        width="95vw"
        centered
        styles={{ body: { height: "85vh", padding: 0, overflow: "hidden" } }}
        destroyOnHidden
        maskClosable
        closable
        keyboard
      >
        <Flex vertical className={styles.body}>
          {pathRow}
          {bodyContent}
          {bottomActions}
        </Flex>
      </Modal>
      <Modal
        title={t("file-browser.content-modal.unsaved-title")}
        open={unsavedConfirmOpen}
        onOk={handleDiscard}
        onCancel={() => setUnsavedConfirmOpen(false)}
        okText={labels.actions.yes}
        cancelText={labels.actions.no}
        destroyOnHidden
        maskClosable
        closable
        keyboard
      >
        <p>{t("file-browser.content-modal.unsaved-confirm")}</p>
      </Modal>
      <Modal
        title={t("file-browser.content-modal.saving-title")}
        open={savingConfirmOpen}
        onOk={handleCloseWhileSaving}
        onCancel={() => setSavingConfirmOpen(false)}
        okText={labels.actions.yes}
        cancelText={labels.actions.no}
        destroyOnHidden
        maskClosable
        closable
        keyboard
      >
        <p>{t("file-browser.content-modal.saving-confirm")}</p>
      </Modal>
    </>
  );
}
