import Form from "@rjsf/antd";
import validator from "@rjsf/validator-ajv8";
import { Alert, Button, message, Typography } from "antd";
import React, { useState, useMemo } from "react";

import type { FormSchema } from "../../types";

import styles from "./form-preview.module.css";

interface FormPreviewProps {
  schema: FormSchema;
}

/**
 * Form preview with RJSF + JSON data output
 */
export const FormPreview: React.FC<FormPreviewProps> = ({ schema }) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Extract pillar schema for display
  const extractedJsonSchema = useMemo(() => {
    if (typeof schema.json_schema === "boolean") {
      return { type: "object" as const, properties: {} };
    }

    const kwargs = schema.json_schema?.properties?.kwargs;
    if (!kwargs || typeof kwargs !== "object") {
      return {
        type: "object" as const,
        properties: {},
      };
    }

    const pillar = kwargs.properties?.pillar;
    if (!pillar || typeof pillar !== "object") {
      return {
        type: "object" as const,
        properties: {},
      };
    }

    return pillar;
  }, [schema.json_schema]);

  const extractedUiSchema = useMemo(() => {
    const kwargs = schema.ui_schema?.kwargs;
    if (!kwargs || typeof kwargs !== "object") return {};
    return (kwargs as Record<string, unknown>).pillar || {};
  }, [schema.ui_schema]);

  // Check for empty schema
  const isEmpty = useMemo(() => {
    return (
      !extractedJsonSchema.properties || Object.keys(extractedJsonSchema.properties).length === 0
    );
  }, [extractedJsonSchema]);

  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <Alert
          message="Schema is empty"
          description="Add fields in the schema editor"
          type="info"
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Form Preview
        </Typography.Title>
        <Form
          className={styles.form}
          schema={extractedJsonSchema as any}
          uiSchema={extractedUiSchema as any}
          formData={formData}
          validator={validator}
          onChange={(e) => setFormData(e.formData)}
          onSubmit={() => {
            message.success("Form valid");
          }}
        >
          <div>
            <Button htmlType="submit">Validate</Button>
          </div>
        </Form>
      </div>
      <div className={styles.dataOutput}>
        <div className={styles.dataOutputTitle}>Form data:</div>
        <pre className={styles.dataOutputContent}>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};
