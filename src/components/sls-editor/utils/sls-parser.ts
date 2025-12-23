import type { FormSchema } from "../types";

/**
 * Parse schema from SLS content
 * Extracts JSON schema from {#start_schema...end_schema#} block
 *
 * @param sls - SLS content with embedded schema
 * @returns Parsed FormSchema object
 * @throws Error if schema block not found or JSON is invalid
 *
 * @example
 * ```ts
 * const sls = `{#start_schema\n{"json_schema": {}}\nend_schema#}`;
 * const schema = parseSchemaFromSls(sls);
 * ```
 */
export function parseSchemaFromSls(sls: string): FormSchema {
  const regex = /{#start_schema\s*([\s\S]*?)\s*end_schema#}/;
  const match = sls.match(regex);

  if (!match) {
    throw new Error("Schema block not found");
  }

  return JSON.parse(match[1]);
}

/**
 * Extract SLS body WITHOUT schema block (v2)
 * Removes {#start_schema...end_schema#} block from SLS
 *
 * @param sls - Full SLS content with schema block
 * @returns SLS body without schema block
 *
 * @example
 * ```ts
 * const sls = `{#start_schema\n{...}\nend_schema#}\n\n{% set name = pillar.name %}`;
 * const body = extractSlsBody(sls);
 * // Returns: "{% set name = pillar.name %}"
 * ```
 */
export function extractSlsBody(sls: string): string {
  const regex = /{#start_schema\s*[\s\S]*?\s*end_schema#}\s*/;
  return sls.replace(regex, "").trim();
}

/**
 * Combine schema and body into full SLS (v2)
 * Assembles complete SLS from separate schema and body
 *
 * @param schema - FormSchema object
 * @param body - SLS body (Jinja2 + YAML) without schema block
 * @returns Complete SLS with schema block at the beginning
 *
 * @example
 * ```ts
 * const fullSls = combineSchemaAndBody(schema, "{% set name = pillar.name %}");
 * ```
 */
export function combineSchemaAndBody(schema: FormSchema, body: string): string {
  const schemaJson = JSON.stringify(schema, null, 2);
  const schemaBlock = `{#start_schema\n${schemaJson}\nend_schema#}`;

  return `${schemaBlock}\n\n${body}`;
}

/**
 * Update schema in SLS content
 * Replaces existing {#start_schema...end_schema#} block with new schema
 * If block doesn't exist, adds it at the beginning
 *
 * @deprecated Use combineSchemaAndBody instead for v2 architecture
 * @param sls - Current SLS content
 * @param schema - New schema to embed
 * @returns Updated SLS content
 *
 * @example
 * ```ts
 * const updated = updateSchemaInSls(sls, newSchema);
 * ```
 */
export function updateSchemaInSls(sls: string, schema: FormSchema): string {
  const body = extractSlsBody(sls);
  return combineSchemaAndBody(schema, body);
}

/**
 * Get empty schema with system fields (kwargs, pillar)
 * Used for initialization when SLS is empty or invalid
 *
 * @returns Empty FormSchema with required structure
 *
 * @example
 * ```ts
 * const emptySchema = getEmptySchema();
 * // Returns schema with kwargs.pillar.properties = {}
 * ```
 */
export function getEmptySchema(): FormSchema {
  return {
    json_schema: {
      type: "object",
      title: "",
      additionalProperties: false,
      required: ["kwargs"],
      properties: {
        kwargs: {
          type: "object",
          additionalProperties: false,
          required: ["pillar"],
          properties: {
            pillar: {
              type: "object",
              required: [],
              properties: {},
            },
          },
        },
      },
    },
    ui_schema: {
      kwargs: {
        "ui:title": "",
        pillar: {
          "ui:title": "",
        },
      },
    },
  };
}

/**
 * Get empty SLS body template WITHOUT schema block (v2)
 * Used for initializing SLS body separately from schema
 *
 * @returns Empty SLS body template
 *
 * @example
 * ```ts
 * const emptyBody = getEmptySlsBody();
 * // Returns: "{% set pillar = kwargs.pillar %}\n\n# Your Salt State here\n"
 * ```
 */
export function getEmptySlsBody(): string {
  return ``;
}

/**
 * Get empty SLS template with schema
 * Used for complete initialization
 *
 * @deprecated Use getEmptySlsBody() + combineSchemaAndBody() for v2 architecture
 * @returns Empty SLS string with schema block
 *
 * @example
 * ```ts
 * const emptySls = getEmptySls();
 * ```
 */
export function getEmptySls(): string {
  return combineSchemaAndBody(getEmptySchema(), getEmptySlsBody());
}
