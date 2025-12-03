import React, { useRef, useEffect, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { IDisposable } from "monaco-editor";
import { SlsMonacoEditor } from "./sls-monaco-editor";
import { registerContextMenu, insertTextAtCursor } from "./registerContextMenu";
import { PillarInsertModal } from "./pillar-insert-modal";
import type { JSONSchema } from "../../types";
import styles from "./sls-editor-tab.module.css";

interface SlsEditorTabProps {
  /**
   * SLS body WITHOUT schema block
   * Contains only Jinja2 + YAML, no {#start_schema...end_schema#} block
   */
  slsBody: string;

  /**
   * Callback when SLS body changes (v2)
   * Receives only the body, schema is managed separately
   */
  onSlsBodyChange: (body: string) => void;

  /**
   * JSON Schema for context menu (Phase 4)
   * Used to extract fields for insertion
   */
  schema: JSONSchema;
}

/**
 * SLS Editor Tab
 *
 * Architecture:
 * - Shows ONLY SLS body (Jinja2 + YAML) in Monaco Editor
 * - Schema block {#start_schema...end_schema#} is NEVER displayed here
 * - Schema is managed through Form Editor tab
 * - Context menu with modal for inserting pillar fields
 *
 * Features:
 * - Monaco Editor with YAML highlighting
 * - Context menu "Insert Pillar..." in separate menu group
 * - Modal with parameter selection and template type choice
 * - Preview of generated template
 * - Automatic synchronization with parent component
 * - Dynamic menu updates when schema changes
 */
export const SlsEditorTab: React.FC<SlsEditorTabProps> = ({
  slsBody,
  onSlsBodyChange,
  schema,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const menuDisposableRef = useRef<IDisposable | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  const handleOpenModal = (fields: string[]) => {
    setAvailableFields(fields);
    setModalOpen(true);
  };

  const handleInsertTemplate = (template: string) => {
    if (editorRef.current) {
      insertTextAtCursor(editorRef.current, template);
    }
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register context menu initially
    menuDisposableRef.current = registerContextMenu(
      editor,
      monaco,
      schema,
      handleOpenModal,
    );
  };

  // Re-register context menu when schema changes
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    // Dispose old menu
    if (menuDisposableRef.current) {
      menuDisposableRef.current.dispose();
    }

    // Register new menu with updated schema
    menuDisposableRef.current = registerContextMenu(
      editorRef.current,
      monacoRef.current,
      schema,
      handleOpenModal,
    );

    // Cleanup on unmount
    return () => {
      if (menuDisposableRef.current) {
        menuDisposableRef.current.dispose();
      }
    };
  }, [schema]);

  return (
    <div className={styles.container}>
      <SlsMonacoEditor
        value={slsBody}
        onChange={onSlsBodyChange}
        onMount={handleEditorMount}
      />

      <PillarInsertModal
        open={modalOpen}
        fields={availableFields}
        onInsert={handleInsertTemplate}
        onCancel={handleModalCancel}
      />
    </div>
  );
};
