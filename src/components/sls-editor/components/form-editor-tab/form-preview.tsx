import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Alert, Button, message, Typography } from "antd";
import { useState, useMemo, useEffect, type FC } from "react";

import { JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS, JsonForm } from "../../../json-form";
import { toRjsfSchema, toRjsfUiSchema } from "../../helpers/to-rjsf-schema";
import type { FormSchema } from "../../types";

import styles from "./form-preview.module.css";

interface FormPreviewProps {
  schema: FormSchema;
}

export const FormPreview: FC<FormPreviewProps> = ({ schema }) => {
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
        <JsonForm
          key={schemaPreviewKey}
          className={styles.form}
          schema={toRjsfSchema(schema?.json_schema)}
          uiSchema={toRjsfUiSchema(schema?.ui_schema)}
          formData={formData}
          onChange={(e) => setFormData(e.formData)}
          onSubmit={() => {
            message.success("Form valid");
          }}
        >
          <Button htmlType="submit">Validate</Button>
        </JsonForm>
      </div>
      <div className={styles.dataOutput}>
        <div className={styles.dataOutputTitle}>Form data:</div>
        <pre className={styles.dataOutputContent}>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};
