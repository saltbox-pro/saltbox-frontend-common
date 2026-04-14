import { WarningOutlined } from "@ant-design/icons";
import {
  canRenderInVisualEditor,
  type VisualEditorCompatibilityResult,
} from "@saltbox/react-jsonschema-form-generator";
import { Tabs, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");

  // Check if visual editor can render the schema
  const compatibility = useMemo((): VisualEditorCompatibilityResult => {
    // Extract pillar schema for compatibility check (same logic as VisualEditorTab)
    const jsonSchema = schema.json_schema;
    const uiSchema = schema.ui_schema;

    let extractedSchema: JSONSchema;
    if (typeof jsonSchema === "boolean") {
      extractedSchema = { type: "object" as const, properties: {} };
    } else {
      const kwargs = jsonSchema?.properties?.kwargs as Record<string, unknown> | undefined;
      if (!kwargs || typeof kwargs !== "object") {
        extractedSchema = { type: "object" as const, properties: {} };
      } else {
        const properties = kwargs.properties as Record<string, unknown> | undefined;
        const pillar = properties?.pillar;
        if (!pillar || typeof pillar !== "object") {
          extractedSchema = { type: "object" as const, properties: {} };
        } else {
          extractedSchema = pillar as JSONSchema;
        }
      }
    }

    const kwargsUi = uiSchema?.kwargs as Record<string, unknown> | undefined;
    const extractedUiSchema: UISchema =
      typeof kwargsUi === "object" && kwargsUi !== null ? (kwargsUi.pillar as UISchema) || {} : {};

    const formSchema: FormSchema = {
      json_schema: extractedSchema,
      ui_schema: extractedUiSchema,
    };

    return canRenderInVisualEditor(formSchema);
  }, [schema]);

  const canRenderVisual = compatibility.compatible;

  const [activeTab, setActiveTab] = useState<string>(canRenderVisual ? "visual" : "json");

  const handleJsonSchemaChange = (jsonSchema: JSONSchema) => {
    onChange({ ...schema, json_schema: jsonSchema });
  };

  const handleUiSchemaChange = (uiSchema: UISchema) => {
    onChange({ ...schema, ui_schema: uiSchema });
  };

  // Build tooltip content for unsupported features
  const unsupportedTooltip = useMemo(() => {
    if (canRenderVisual) return null;

    const features = compatibility.unsupportedFeatures;
    return (
      <div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>
          {t("sls-editor.visual-editor-unavailable")}
        </div>
        <div style={{ fontSize: 12 }}>{t("sls-editor.schema-unsupported-constructs")}</div>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: 16, fontSize: 12 }}>
          {features.slice(0, 5).map((f, i) => (
            <li key={i}>
              <code>{f.feature}</code>
              {f.path !== "(root)" && (
                <span style={{ opacity: 0.7 }}> {t("sls-editor.in-path", { path: f.path })}</span>
              )}
            </li>
          ))}
          {features.length > 5 && (
            <li style={{ opacity: 0.7 }}>
              {t("sls-editor.and-more", { count: features.length - 5 })}
            </li>
          )}
        </ul>
      </div>
    );
  }, [canRenderVisual, compatibility.unsupportedFeatures]);

  const items = useMemo(() => {
    const visualTabLabel = canRenderVisual ? (
      "Editor"
    ) : (
      <Tooltip title={unsupportedTooltip} placement="bottom">
        <span style={{ color: "rgba(0, 0, 0, 0.25)" }}>
          <WarningOutlined style={{ marginRight: 4, color: "#faad14" }} />
          Editor
        </span>
      </Tooltip>
    );

    return [
      {
        key: "visual",
        label: visualTabLabel,
        disabled: !canRenderVisual,
        children: canRenderVisual ? (
          <VisualEditorTab
            jsonSchema={schema.json_schema}
            uiSchema={schema.ui_schema}
            onChange={onChange}
          />
        ) : null,
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
  }, [
    canRenderVisual,
    unsupportedTooltip,
    schema,
    onChange,
    handleJsonSchemaChange,
    handleUiSchemaChange,
  ]);

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} className={styles.tabs} />
  );
};
