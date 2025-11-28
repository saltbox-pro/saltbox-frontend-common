import React from "react";
import type { FormSchema } from "../../types";
import { SchemaEditor } from "./SchemaEditor";
import { FormPreview } from "./FormPreview";
import styles from "./FormEditorTab.module.css";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import { Button } from "antd";

interface FormEditorTabProps {
  schema: FormSchema;
  onSchemaChange: (schema: FormSchema) => void;
}

/**
 * Form editor tab
 *
 * Contains:
 * - Schema editor (65% width) - visual editor, JSON Schema, UI Schema
 * - Form preview (35% width) - live preview of form + JSON data output
 */

export const FormEditorTab: React.FC<FormEditorTabProps> = ({
  schema,
  onSchemaChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.schemaEditor}>
        <SchemaEditor schema={schema} onChange={onSchemaChange} />
      </div>
      <div className={styles.formPreview}>
        <FormPreview schema={schema} />
      </div>
    </div>
  );
};
