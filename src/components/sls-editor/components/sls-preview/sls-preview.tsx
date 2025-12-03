import React from "react";
import Editor from "@monaco-editor/react";
import type { FormSchema } from "../../types";
import { combineSchemaAndBody } from "../../utils/sls-parser";
import styles from "./sls-preview.module.css";

export interface SlsPreviewProps {
  /**
   * Schema object for preview
   */
  schema: FormSchema;
  /**
   * SLS body content (without schema block)
   */
  slsBody: string;
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * SlsPreview - read-only preview component for final SLS content
 *
 * Displays the complete SLS file (schema block + body) in Monaco Editor
 * with YAML syntax highlighting in read-only mode.
 *
 * @example
 * ```tsx
 * <SlsPreview
 *   schema={schema}
 *   slsBody={slsBody}
 * />
 * ```
 */
export const SlsPreview: React.FC<SlsPreviewProps> = ({
  schema,
  slsBody,
  className,
}) => {
  // Combine schema and body to get final SLS
  const finalSls = combineSchemaAndBody(schema, slsBody);

  return (
    <div className={`${styles.slsPreview} ${className || ""}`}>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={finalSls}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "on",
          renderWhitespace: "selection",
          contextmenu: false,
          tabSize: 2,
          wordWrap: "on",
          wrappingIndent: "indent",
        }}
      />
    </div>
  );
};
