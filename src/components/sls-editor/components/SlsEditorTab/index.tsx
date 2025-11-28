import React, { useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import { SlsMonacoEditor } from "./SlsMonacoEditor";
import type { JSONSchema } from "../../types";
import styles from "./SlsEditorTab.module.css";

interface SlsEditorTabProps {
  /**
   * SLS body WITHOUT schema block (v2)
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
 * SLS Editor Tab (v2)
 *
 * V2 Architecture:
 * - Shows ONLY SLS body (Jinja2 + YAML) in Monaco Editor
 * - Schema block {#start_schema...end_schema#} is NEVER displayed here
 * - Schema is managed through Form Editor tab
 * - Context menu for inserting fields (Phase 4)
 *
 * Features:
 * - Monaco Editor with YAML highlighting
 * - 300ms debounce on changes
 * - Context menu support (TODO: Phase 4)
 * - Automatic synchronization with parent component
 */
export const SlsEditorTab: React.FC<SlsEditorTabProps> = ({
  slsBody,
  onSlsBodyChange,
  schema,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // TODO: Phase 4 - Register context menu
    // registerContextMenu(editor, monaco, schema);
  };

  return (
    <div className={styles.container}>
      <SlsMonacoEditor
        value={slsBody}
        onChange={onSlsBodyChange}
        onMount={handleEditorMount}
      />
    </div>
  );
};
