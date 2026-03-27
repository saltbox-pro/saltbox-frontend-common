import Editor, { type EditorProps } from "@monaco-editor/react";
import { type FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import styles from "./json-editor.module.css";

const DEFAULT_EDITOR_OPTIONS: EditorProps["options"] = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  lineNumbers: "on",
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
  suggest: {
    showProperties: false,
  },
} as const;

export interface JsonEditorProps {
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  height?: EditorProps["height"];
  className?: EditorProps["className"];
  editorOptions?: EditorProps["options"];
  loading?: EditorProps["loading"];
}

export const JsonEditor: FC<JsonEditorProps> = ({
  value = "",
  onChange,
  height = 260,
  disabled = false,
  className = "",
  editorOptions,
  loading,
}) => {
  const { t } = useTranslation("common");

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      onChange?.(newValue ?? "");
    },
    [onChange]
  );

  const options = useMemo(
    () => ({
      ...DEFAULT_EDITOR_OPTIONS,
      ...editorOptions,
      readOnly: disabled,
      contextmenu: !disabled,
      renderLineHighlight: disabled
        ? "none"
        : (editorOptions?.renderLineHighlight ??
          DEFAULT_EDITOR_OPTIONS.renderLineHighlight ??
          "line"),
      selectionHighlight: !disabled,
    }),
    [editorOptions, disabled]
  );

  return (
    <Editor
      className={`${styles.jsonEditor} ${disabled ? styles.jsonEditor_disabled : ""} ${className}`}
      height={height}
      language="json"
      value={value}
      onChange={handleChange}
      options={options}
      loading={loading ?? t("json-editor.loading")}
    />
  );
};
