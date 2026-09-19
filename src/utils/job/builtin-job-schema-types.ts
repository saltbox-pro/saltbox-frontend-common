import type { TemplateSchemaI18n } from "saltbox-common/components/json-form/utils/template-schema-i18n";

export type BuiltinJobSchemaMeta = {
  name: string;
  title?: string;
  description?: string;
  fun?: string;
  json_schema: Record<string, unknown>;
  ui_schema?: Record<string, unknown>;
  i18n?: TemplateSchemaI18n;
  defaults?: { ttl?: number | null } | null;
};

export type BuiltinJobSchema = {
  name: string;
  json_schema: Record<string, unknown>;
  ui_schema?: Record<string, unknown>;
};
