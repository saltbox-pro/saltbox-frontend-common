import Editor from "@monaco-editor/react";
import { Alert } from "antd";
import React, { useState, useCallback, useEffect } from "react";

import type { UISchema } from "../../types";

interface UiSchemaTabProps {
  schema: UISchema;
  onChange: (schema: UISchema) => void;
}

/**
 * Monaco editor for UI Schema
 */
export const UiSchemaTab: React.FC<UiSchemaTabProps> = ({ schema, onChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(() => JSON.stringify(schema, null, 2));

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (!newValue) return;

      setValue(newValue);

      try {
        const parsed = JSON.parse(newValue);
        setError(null);
        onChange(parsed);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [onChange]
  );

  // Synchronize value when schema changes externally
  useEffect(() => {
    setValue(JSON.stringify(schema, null, 2));
  }, [schema]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {error && (
        <Alert
          message="JSON parsing error"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 8 }}
        />
      )}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="json"
          value={value}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
