import { SettingOutlined } from "@ant-design/icons";
import { Tabs, Alert, Dropdown, Button, Flex } from "antd";
import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { FormEditorTab } from "./components/form-editor-tab/form-editor-tab";
import { SlsEditorTab } from "./components/sls-editor-tab";
import styles from "./sls-editor.module.css";
import type { SlsEditorProps, FormSchema } from "./types";
import {
  parseSchemaFromSls,
  extractSlsBody,
  combineSchemaAndBody,
  getEmptySchema,
  getEmptySlsBody,
} from "./utils/sls-parser";

/**
 * SlsEditor - component for editing Salt State files with integrated JSON Schema form editor
 *
 * V2 Architecture:
 * - Internally splits SLS into schema and body (slsBody)
 * - Schema block {#start_schema...end_schema#} is NEVER shown in SLS Editor tab
 * - User edits only the clean SLS body (Jinja2 + YAML) in Monaco Editor
 * - Schema is managed only through Form Editor tab
 * - onSlsChange ALWAYS receives full SLS with schema block
 *
 * Features:
 * - Tab 1: Form Editor - visual schema editor + form preview
 * - Tab 2: SLS Editor - Monaco editor with YAML highlighting (body only, no schema)
 * - Additional tabs - support for custom tabs
 * - Automatic synchronization - schema changes automatically update full SLS
 *
 * @see /SLS_EDITOR_SPEC_v2.md - Technical specification v2
 * @see /SLS_EDITOR_TASKS_v2.md - Development plan v2
 *
 * @example
 * ```tsx
 * <SlsEditor
 *   sls={slsContent}
 *   onSlsChange={(newSls) => console.log(newSls)}
 *   defaultTab="form-editor"
 * />
 * ```
 */
export const SlsEditor: React.FC<SlsEditorProps> = ({
  sls: initialSls,
  onSlsChange,
  additionalTabs = [],
  defaultTab = "form-editor",
  className,
  menu,
  tabBarExtra,
}) => {
  // V2: Separate state for schema and SLS body
  const [schema, setSchema] = useState<FormSchema>(getEmptySchema());
  const [slsBody, setSlsBody] = useState<string>(getEmptySlsBody());
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { t } = useTranslation("common");

  // V2: Parse incoming SLS on mount and when it changes externally
  useEffect(() => {
    if (!initialSls) {
      setSchema(getEmptySchema());
      setSlsBody(getEmptySlsBody());
      setError(null);
      return;
    }

    try {
      const parsedSchema = parseSchemaFromSls(initialSls);
      const parsedBody = extractSlsBody(initialSls);

      setSchema(parsedSchema);
      setSlsBody(parsedBody);
      setError(null);
    } catch (err) {
      console.error("Error parsing SLS:", err);
      setError((err as Error).message);
      setSchema(getEmptySchema());
      setSlsBody(getEmptySlsBody());
    }
  }, [initialSls]);

  /**
   * V2: Handle schema changes from Form Editor
   * Updates schema state and calls onSlsChange with combined schema + body
   */
  const handleSchemaChange = useCallback(
    (newSchema: FormSchema) => {
      setSchema(newSchema);
      onSlsChange?.(combineSchemaAndBody(newSchema, slsBody));
    },
    [slsBody, onSlsChange]
  );

  /**
   * V2: Handle SLS body changes from SLS Editor
   * Updates slsBody state and calls onSlsChange with combined schema + body
   */
  const handleSlsBodyChange = useCallback(
    (newBody: string) => {
      setSlsBody(newBody);
      onSlsChange?.(combineSchemaAndBody(schema, newBody));
    },
    [schema, onSlsChange]
  );

  const items = [
    {
      key: "form-editor",
      label: t("sls-editor.tab-form-editor"),
      children: (
        <div className={styles.tabContent}>
          {error && (
            <Alert
              message={t("sls-editor.schema-parsing-error")}
              description={error}
              type="error"
              closable
              style={{ margin: 16 }}
            />
          )}
          {!error && <FormEditorTab schema={schema} onSchemaChange={handleSchemaChange} />}
        </div>
      ),
    },
    {
      key: "sls-editor",
      label: t("sls-editor.tab-sls-editor"),
      children: (
        <div className={styles.tabContent}>
          {error && (
            <Alert
              message={t("sls-editor.schema-parsing-error")}
              description={error}
              type="error"
              closable
              style={{ margin: 16 }}
            />
          )}
          {!error && (
            <SlsEditorTab
              slsBody={slsBody}
              onSlsBodyChange={handleSlsBodyChange}
              schema={schema.json_schema}
            />
          )}
        </div>
      ),
    },
    // Add additional custom tabs
    ...additionalTabs.map((tab) => ({
      key: tab.key,
      label: tab.title,
      children: <div className={styles.tabContent}>{tab.content}</div>,
    })),
  ];

  return (
    <div className={`${styles.slsEditor} ${className || ""}`}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className={styles.tabs}
        tabBarExtraContent={
          menu || tabBarExtra
            ? {
                right: (
                  <Flex gap={8} align="center">
                    {tabBarExtra}
                    {menu && (
                      <Dropdown menu={menu} trigger={["click"]}>
                        <Button icon={<SettingOutlined />} />
                      </Dropdown>
                    )}
                  </Flex>
                ),
              }
            : undefined
        }
      />
    </div>
  );
};
