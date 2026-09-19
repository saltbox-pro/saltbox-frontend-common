import {
  localizeTemplateSchemaText,
  localizeTemplateUiSchema,
} from "saltbox-common/components/json-form/utils/template-schema-i18n";

import type { BuiltinJobSchema, BuiltinJobSchemaMeta } from "./builtin-job-schema-types";

const resolvedCache = new Map<string, BuiltinJobSchema>();

export const resolveBuiltinJobSchema = (
  meta: BuiltinJobSchemaMeta,
  language: string
): BuiltinJobSchema => {
  const cacheKey = `${meta.name}|${language}`;
  const cached = resolvedCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const title = localizeTemplateSchemaText(meta.title, meta.i18n, language);
  const description = localizeTemplateSchemaText(meta.description, meta.i18n, language);

  const resolved: BuiltinJobSchema = {
    name: meta.name,
    json_schema: {
      ...meta.json_schema,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    ui_schema: localizeTemplateUiSchema(meta.ui_schema, meta.i18n, language),
  };

  resolvedCache.set(cacheKey, resolved);

  return resolved;
};
