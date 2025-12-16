import { Tabs } from "antd";
import React, { useState } from "react";

import type { FormSchema, JSONSchema, UISchema } from "../../types";

import { JsonSchemaTab } from "./json-schema-tab";
import styles from "./schema-editor.module.css";
import { UiSchemaTab } from "./ui-schema-tab";
import { VisualEditorTab } from "./visual-editor-tab";

interface SchemaEditorProps {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
}

/**
 * Schema editor with three tabs:
 * 1. Visual editor (react-jsonschema-form-generator)
 * 2. JSON Schema editor (Monaco)
 * 3. UI Schema editor (Monaco)
 */
export const SchemaEditor: React.FC<SchemaEditorProps> = ({ schema, onChange }) => {
  const [activeTab, setActiveTab] = useState<string>("visual");

  const handleJsonSchemaChange = (jsonSchema: JSONSchema) => {
    onChange({ ...schema, json_schema: jsonSchema });
  };

  const handleUiSchemaChange = (uiSchema: UISchema) => {
    onChange({ ...schema, ui_schema: uiSchema });
  };

  const items = [
    {
      key: "visual",
      label: "Editor",
      children: (
        <VisualEditorTab
          jsonSchema={schema.json_schema}
          uiSchema={schema.ui_schema}
          onChange={onChange}
        />
      ),
    },
    {
      key: "json",
      label: "JSON Schema",
      children: <JsonSchemaTab schema={schema.json_schema} onChange={handleJsonSchemaChange} />,
    },
    {
      key: "ui",
      label: "UI Schema",
      children: <UiSchemaTab schema={schema.ui_schema} onChange={handleUiSchemaChange} />,
    },
  ];

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className={styles.tabs} />
  );
};
