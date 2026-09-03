import { rjsfValidator } from "../components/json-form/utils/rjsf-validator";
import { defaultAjvValidator } from "../components/json-form/utils/validate-data";

export type TemplateSchemaError = {
  message: string;
  schemaPath?: string;
};

export type TemplateSchemaErrorDetailsLabels = {
  formatSource?: (sourceName: string) => string;
  formatSchemaPath?: (path: string) => string;
};

export type ValidateTemplateJsonSchemasParams = {
  rawSchema: unknown;
  rjsfSchema: unknown;
  schemaPath?: string;
};

function tryCompileSchema(schema: unknown, compile: (value: object) => unknown): string | null {
  if (schema == null || typeof schema === "boolean") {
    return null;
  }

  if (typeof schema !== "object") {
    return null;
  }

  try {
    compile(schema);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function validateTemplateJsonSchemas({
  rawSchema,
  rjsfSchema,
  schemaPath,
}: ValidateTemplateJsonSchemasParams): TemplateSchemaError | null {
  const rawSchemaError = tryCompileSchema(rawSchema, (schema) =>
    defaultAjvValidator.compile(schema)
  );
  if (rawSchemaError) {
    return { message: rawSchemaError, schemaPath };
  }

  const rjsfSchemaError = tryCompileSchema(rjsfSchema, (schema) =>
    rjsfValidator.ajv.compile(schema)
  );
  if (rjsfSchemaError) {
    return { message: rjsfSchemaError, schemaPath };
  }

  return null;
}

export function formatTemplateSchemaErrorDetails(
  error: TemplateSchemaError,
  labels: TemplateSchemaErrorDetailsLabels,
  options?: { sourceName?: string }
): string {
  const metadata: string[] = [];

  if (options?.sourceName && labels.formatSource) {
    metadata.push(labels.formatSource(options.sourceName));
  }

  if (error.schemaPath && labels.formatSchemaPath) {
    metadata.push(labels.formatSchemaPath(error.schemaPath));
  }

  if (metadata.length === 0) {
    return error.message;
  }

  return [error.message, metadata.join("\n")].join("\n\n");
}
