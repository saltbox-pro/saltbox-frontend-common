import { FormInstance } from "antd";
import { useMemo } from "react";

import { JsonEditor, type JsonEditorProps } from "../../../json-editor/ui/json-editor";

import styles from "./json-editor-field.module.css";

interface JsonEditorFieldProps extends JsonEditorProps {
  form?: FormInstance;
  fieldName?: Parameters<FormInstance["getFieldError"]>[0];
}

export function JsonEditorField({
  form,
  fieldName = "value",
  disabled,
  editorOptions,
  ...editorProps
}: JsonEditorFieldProps) {
  const errors = form?.getFieldError(fieldName);
  const hasError = Array.isArray(errors) && errors.length > 0;

  const mergedEditorOptions = useMemo<JsonEditorProps["editorOptions"]>(
    () => ({
      padding: { top: 5, bottom: 5 },
      ...editorOptions,
      scrollbar: {
        ...(editorOptions?.scrollbar ?? {}),
        alwaysConsumeMouseWheel: false,
      },
    }),
    [editorOptions]
  );

  return (
    <div
      className={`${styles.jsonEditorWrapper} ${hasError ? styles.jsonEditorWrapper_error : ""} ${
        disabled ? styles.jsonEditorWrapper_disabled : ""
      }`}
    >
      <JsonEditor disabled={disabled} editorOptions={mergedEditorOptions} {...editorProps} />
    </div>
  );
}
