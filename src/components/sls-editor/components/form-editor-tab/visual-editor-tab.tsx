import React, { useMemo, useCallback } from "react";
import { SchemaVisualEditor } from "@saltbox/react-jsonschema-form-generator";
import "@saltbox/react-jsonschema-form-generator/styles.css";
import type { FormSchema, JSONSchema, UISchema } from "../../types";

interface VisualEditorTabProps {
  jsonSchema: JSONSchema;
  uiSchema: UISchema;
  onChange: (schema: FormSchema) => void;
}

/**
 * Visual schema editor using react-jsonschema-form-generator
 *
 * Edits only pillar.properties, hiding system kwargs fields
 */
export const VisualEditorTab: React.FC<VisualEditorTabProps> = ({
  jsonSchema,
  uiSchema,
  onChange,
}) => {
  // Extract pillar.properties for editing
  const extractedSchema = useMemo(() => {
    if (typeof jsonSchema === "boolean") {
      return { type: "object" as const, properties: {} };
    }

    const kwargs = jsonSchema?.properties?.kwargs;
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
  }, [jsonSchema]);

  const extractedUiSchema = useMemo(() => {
    const kwargs = uiSchema?.kwargs;
    if (!kwargs || typeof kwargs !== "object") return {};
    return ((kwargs as Record<string, unknown>).pillar || {}) as UISchema;
  }, [uiSchema]);

  // Wrap back into system kwargs.pillar fields
  const handleChange = useCallback(
    (editedSchemaOrFormSchema: unknown) => {
      // Check if editor returned FormSchema or JSONSchema
      let editedSchema: JSONSchema;
      let editedUiSchema: UISchema = {};

      if (
        typeof editedSchemaOrFormSchema === "object" &&
        editedSchemaOrFormSchema !== null &&
        "json_schema" in editedSchemaOrFormSchema
      ) {
        // This is FormSchema, extract both json_schema and ui_schema
        const formSchema = editedSchemaOrFormSchema as FormSchema;
        editedSchema = formSchema.json_schema;
        editedUiSchema = formSchema.ui_schema || {};
      } else {
        // This is JSONSchema only
        editedSchema = editedSchemaOrFormSchema as JSONSchema;
      }

      const wrappedJsonSchema: JSONSchema = {
        ...(typeof jsonSchema === "boolean" ? {} : jsonSchema),
        type: "object",
        title: (typeof jsonSchema === "boolean" ? "" : jsonSchema.title) || "",
        additionalProperties: false,
        required: ["kwargs"],
        properties: {
          kwargs: {
            type: "object",
            additionalProperties: false,
            required: ["pillar"],
            properties: {
              pillar: editedSchema,
            },
          },
        },
      };

      // Wrap UI schema back into kwargs.pillar structure
      const wrappedUiSchema: UISchema = {
        ...(typeof uiSchema === "object" && uiSchema !== null ? uiSchema : {}),
        kwargs: {
          ...(typeof uiSchema?.kwargs === "object" && uiSchema.kwargs !== null
            ? uiSchema.kwargs
            : {}),
          pillar: editedUiSchema,
        },
      };

      onChange({
        json_schema: wrappedJsonSchema,
        ui_schema: wrappedUiSchema,
      });
    },
    [jsonSchema, uiSchema, onChange],
  );

  const formSchema: FormSchema = useMemo(() => {
    return {
      json_schema: extractedSchema,
      ui_schema: extractedUiSchema,
    } as FormSchema;
  }, [extractedSchema, extractedUiSchema]);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "16px" }}>
      <SchemaVisualEditor schema={formSchema} onChange={handleChange} />
    </div>
  );
};
