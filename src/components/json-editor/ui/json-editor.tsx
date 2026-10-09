import Editor, { type EditorProps, useMonaco } from "@monaco-editor/react";
import { type FC, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { JsonEditorSchema } from "../types";
import {
  acquireJsonEditorSchema,
  releaseJsonEditorSchema,
} from "../utils/monaco-json-schema-registry";

import styles from "./json-editor.module.css";

export type { JsonEditorSchema };

const DEFAULT_EDITOR_OPTIONS: EditorProps["options"] = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  lineNumbers: "on",
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  suggest: {
    showProperties: false,
  },
} as const;

export interface JsonEditorProps {
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onValidate?: EditorProps["onValidate"];
  height?: EditorProps["height"];
  className?: EditorProps["className"];
  editorOptions?: EditorProps["options"];
  loading?: EditorProps["loading"];
  path?: string;
  jsonSchema?: JsonEditorSchema;
}

export const JsonEditor: FC<JsonEditorProps> = ({
  value = "",
  onChange,
  onValidate,
  height = 260,
  disabled = false,
  className = "",
  editorOptions,
  loading,
  path,
  jsonSchema,
}) => {
  const { t } = useTranslation("common");
  const monaco = useMonaco();

  const schemaUri = jsonSchema?.uri;
  const schemaFileMatchKey = jsonSchema?.fileMatch.join("\0");
  const schemaBody = jsonSchema?.schema;

  useEffect(() => {
    if (!monaco || !jsonSchema || !schemaUri || schemaBody === undefined) {
      return;
    }

    acquireJsonEditorSchema(monaco, jsonSchema);

    return () => {
      releaseJsonEditorSchema(monaco, schemaUri);
    };
  }, [monaco, jsonSchema, schemaUri, schemaFileMatchKey, schemaBody]);

  useEffect(() => {
    if (!monaco || !path) {
      return;
    }

    return () => {
      const model = monaco.editor.getModel(monaco.Uri.parse(path));
      model?.dispose();
    };
  }, [monaco, path]);

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
      path={path}
      value={value}
      onChange={handleChange}
      onValidate={onValidate}
      options={options}
      loading={loading ?? t("json-editor.loading")}
    />
  );
};
