import Editor from "@monaco-editor/react";
import { Alert } from "antd";
import React, { useState, useCallback, useEffect } from "react";

import type { JSONSchema } from "../../types";
import { validateJSONSchema } from "../../utils/schema-validator";

interface JsonSchemaTabProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
}

/**
 * Monaco editor for JSON Schema with validation
 */
export const JsonSchemaTab: React.FC<JsonSchemaTabProps> = ({ schema, onChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(() => JSON.stringify(schema, null, 2));

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (!newValue) return;

      setValue(newValue);

      try {
        const parsed = JSON.parse(newValue);
        const validation = validateJSONSchema(parsed);

        if (!validation.valid) {
          setError(validation.errors.join(", "));
          return;
        }

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
          message="Validation error"
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
