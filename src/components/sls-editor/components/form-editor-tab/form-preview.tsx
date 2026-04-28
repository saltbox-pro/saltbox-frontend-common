import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Alert, Button, message, Typography } from "antd";
import React, { useState, useMemo, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";

import { JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS, JsonForm } from "../../../json-form";
import { toRjsfSchema, toRjsfUiSchema } from "../../helpers/to-rjsf-schema";
import type { FormSchema } from "../../types";

import styles from "./form-preview.module.css";

interface FormPreviewProps {
  schema: FormSchema;
}

interface FormPreviewErrorBoundaryProps {
  resetKey: string;
  message: string;
  description: string;
  children: React.ReactNode;
}

class FormPreviewErrorBoundary extends React.Component<
  FormPreviewErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("FormPreview render error:", error);
  }

  componentDidUpdate(prev: FormPreviewErrorBoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert type="error" message={this.props.message} description={this.props.description} />
      );
    }
    return this.props.children;
  }
}

export const FormPreview: FC<FormPreviewProps> = ({ schema }) => {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState<unknown>({});

  const isEmpty = useMemo(() => {
    return !schema?.json_schema || Object.keys(schema?.json_schema).length === 0;
  }, [schema?.json_schema]);

  const schemaPreviewKey = useMemo(
    () => JSON.stringify({ json_schema: schema?.json_schema, ui_schema: schema?.ui_schema }),
    [schema?.json_schema, schema?.ui_schema]
  );

  useEffect(() => {
    if (
      !schema.json_schema ||
      typeof schema.json_schema === "boolean" ||
      Object.keys(schema.json_schema).length === 0
    ) {
      setFormData({});
      return;
    }

    const rjsfSchema = toRjsfSchema(schema.json_schema);
    const next = getDefaultFormState(
      validator,
      rjsfSchema,
      undefined,
      rjsfSchema,
      undefined,
      JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS
    );
    setFormData(next ?? {});
  }, [schema?.json_schema, schema?.ui_schema]);

  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <Alert
          message={t("sls-editor.schema-empty")}
          description={t("sls-editor.schema-empty-description")}
          type="info"
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          {t("sls-editor.form-preview")}
        </Typography.Title>
        <FormPreviewErrorBoundary
          resetKey={schemaPreviewKey}
          message={t("sls-editor.form-preview-error")}
          description={t("sls-editor.form-preview-error-description")}
        >
          <JsonForm
            key={schemaPreviewKey}
            className={styles.form}
            schema={toRjsfSchema(schema?.json_schema)}
            uiSchema={toRjsfUiSchema(schema?.ui_schema)}
            formData={formData}
            onChange={(e) => setFormData(e.formData)}
            onSubmit={() => {
              message.success(t("sls-editor.form-valid"));
            }}
          >
            <Button htmlType="submit">{t("sls-editor.validate")}</Button>
          </JsonForm>
        </FormPreviewErrorBoundary>
      </div>
      <div className={styles.dataOutput}>
        <div className={styles.dataOutputTitle}>{t("sls-editor.form-data")}</div>
        <pre className={styles.dataOutputContent}>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};
