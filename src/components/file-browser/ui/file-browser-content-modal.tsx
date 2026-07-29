import { LockOutlined } from "@ant-design/icons";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Alert, Button, Empty, Spin, Tag } from "antd";
import type { editor } from "monaco-editor";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "../../antd-wrappers/modal";
import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";
import { useFileBrowserLocale } from "../hooks/use-file-browser-locale";
import type { FileBrowserLocaleOverrides } from "../model/types";
import { getMonacoLanguage } from "../utils/language-utils";

import styles from "./file-browser-content-modal.module.css";

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

export interface FileBrowserContentModalProps {
  open: boolean;
  fileName: string;
  filePath?: string;
  pathCopyText?: string;
  pathCopyTitle?: string;
  pathCopySuccessMessage?: string;
  pathCopyErrorMessage?: string;
  language?: string;
  content: string;
  loading?: boolean;
  empty?: boolean;
  error?: ReactNode;
  readOnly?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  locale?: FileBrowserLocaleOverrides;
  headerExtra?: ReactNode;
  onChange?: (value: string) => void;
  onSave?: () => void | Promise<void>;
  onClose: () => void;
  onEditorMount?: OnMount;
}

export function FileBrowserContentModal({
  open,
  fileName,
  filePath,
  pathCopyText,
  pathCopyTitle,
  pathCopySuccessMessage,
  pathCopyErrorMessage,
  language,
  content,
  loading = false,
  empty = false,
  error,
  readOnly = false,
  isDirty = false,
  isSaving = false,
  locale,
  headerExtra,
  onChange,
  onSave,
  onClose,
  onEditorMount,
}: FileBrowserContentModalProps) {
  const { t } = useTranslation("common");
  const labels = useFileBrowserLocale(locale);
  const [unsavedConfirmOpen, setUnsavedConfirmOpen] = useState(false);
  const resolvedLanguage = language ?? getMonacoLanguage(fileName);
  const resolvedPathCopyText = pathCopyText ?? filePath ?? "";
  const showPathCopy = resolvedPathCopyText.length > 0;
  const showContentCopy = !loading && error == null && !empty && content.length > 0;

  useEffect(() => {
    if (!open) {
      setUnsavedConfirmOpen(false);
    }
  }, [open]);

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
    <div className={styles.headerInfo}>
      <div className={styles.headerTitleRow}>
        <span className={styles.headerFileName}>{fileName}</span>
        <Tag>{resolvedLanguage}</Tag>
        {readOnly && <Tag icon={<LockOutlined />}>{t("file-browser.content-modal.read-only")}</Tag>}
        {headerExtra}
        {!readOnly && isDirty && (
          <span
            className={styles.dirtyIndicator}
            title={t("file-browser.content-modal.unsaved-changes")}
          />
        )}
      </div>
    </div>
  );

  const showPathRow = (filePath != null && filePath.length > 0) || showContentCopy;

  const pathRow = showPathRow ? (
    <div className={styles.pathRow}>
      {filePath != null && filePath.length > 0 && (
        <>
          <div className={styles.pathText} title={filePath}>
            {filePath}
          </div>
          {showPathCopy && (
            <CopyToClipboardButton
              text={resolvedPathCopyText}
              size="small"
              type="text"
              title={pathCopyTitle ?? t("file-browser.content-modal.copy-path")}
              successMessage={pathCopySuccessMessage}
              errorMessage={pathCopyErrorMessage}
            />
          )}
        </>
      )}
      {showContentCopy && (
        <CopyToClipboardButton
          className={styles.pathRowContentCopy}
          text={content}
          size="small"
          type="text"
          title={t("file-browser.content-modal.copy-content")}
        />
      )}
    </div>
  ) : null;

  const footer = (
    <>
      <Button onClick={handleClose} disabled={isSaving}>
        {readOnly ? t("file-browser.content-modal.close") : labels.actions.cancel}
      </Button>
      {!readOnly && (
        <Button
          type="primary"
          onClick={() => {
            Promise.resolve(onSave?.()).catch(() => undefined);
          }}
          disabled={!isDirty || isSaving || loading || error != null}
          loading={isSaving}
        >
          {t("file-browser.content-modal.save")}
        </Button>
      )}
    </>
  );

  let body: ReactNode;
  if (loading) {
    body = (
      <div className={styles.body}>
        {pathRow}
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  } else if (error != null) {
    body = (
      <div className={styles.body}>
        {pathRow}
        <Alert type="error" showIcon message={error} />
      </div>
    );
  } else if (empty) {
    body = (
      <div className={styles.body}>
        {pathRow}
        <div className={styles.emptyContainer}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("file-browser.content-modal.empty-file")}
          />
        </div>
      </div>
    );
  } else {
    body = (
      <div className={styles.body}>
        {pathRow}
        <div
          className={`${styles.editorContainer}${readOnly ? ` ${styles.editorContainer_readOnly}` : ""}`}
        >
          <Editor
            height="100%"
            language={resolvedLanguage}
            value={content}
            onChange={handleChange}
            onMount={onEditorMount}
            options={options}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        open={open}
        title={title}
        footer={footer}
        onCancel={handleClose}
        width="95vw"
        centered
        styles={{ body: { height: "85vh", padding: 0, overflow: "hidden" } }}
        destroyOnHidden
        maskClosable={!isSaving}
        closable={!isSaving}
        keyboard={!isSaving}
      >
        {body}
      </Modal>
      <Modal
        title={t("file-browser.content-modal.unsaved-title")}
        open={unsavedConfirmOpen}
        onOk={handleDiscard}
        onCancel={() => setUnsavedConfirmOpen(false)}
        okText={labels.actions.yes}
        cancelText={labels.actions.no}
        maskClosable
        closable
        keyboard
      >
        <p>{t("file-browser.content-modal.unsaved-confirm")}</p>
      </Modal>
    </>
  );
}
