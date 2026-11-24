import { omitExtraData, type RJSFSchema } from "@rjsf/utils";

import { rjsfValidator } from "saltbox-common/components/json-form/utils/rjsf-validator";

export type JsonSchemaRecord = Record<string, unknown>;
export type UiSchemaRecord = Record<string, unknown>;

export type JobParamsSchemaLayout = {
  displaySchema: JsonSchemaRecord | null;
  displayUiSchema: UiSchemaRecord | undefined;
  visibleSchema: JsonSchemaRecord | null;
};

type SplitSchemaResult = {
  requiredSchema: JsonSchemaRecord | null;
  optionalSchema: JsonSchemaRecord | null;
};

const COMBINATOR_KEYWORDS = ["$ref", "oneOf", "anyOf", "allOf", "enum", "const"] as const;

export const isJsonSchemaRecord = (value: unknown): value is JsonSchemaRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getRequiredPropertyNames = (schema: JsonSchemaRecord): string[] => {
  const required = schema.required;
  return Array.isArray(required)
    ? required.filter((name): name is string => typeof name === "string")
    : [];
};

const isArrayFieldRequired = (schema: JsonSchemaRecord): boolean => {
  const minItems = schema.minItems;
  return typeof minItems === "number" && minItems >= 1;
};

const getNamedProperties = (schema: JsonSchemaRecord): JsonSchemaRecord | null => {
  const properties = schema.properties;
  return isJsonSchemaRecord(properties) && Object.keys(properties).length > 0 ? properties : null;
};

const isSplittableObjectSchema = (schema: JsonSchemaRecord): boolean =>
  getNamedProperties(schema) !== null &&
  COMBINATOR_KEYWORDS.every((keyword) => schema[keyword] === undefined);

const buildObjectSubsetSchema = (
  baseSchema: JsonSchemaRecord,
  properties: JsonSchemaRecord,
  required?: string[]
): JsonSchemaRecord | null => {
  if (Object.keys(properties).length === 0) {
    return null;
  }

  const subset: JsonSchemaRecord = {
    ...baseSchema,
    properties,
  };

  if (required && required.length > 0) {
    subset.required = required;
  } else {
    delete subset.required;
  }

  const baseProperties = getNamedProperties(baseSchema) ?? {};
  const hasOmittedProperties =
    Object.keys(baseProperties).length !== Object.keys(properties).length;

  if (hasOmittedProperties && subset.additionalProperties === false) {
    delete subset.additionalProperties;
  }

  return subset;
};

const splitSchemaByRequired = (schema: JsonSchemaRecord, isRoot = false): SplitSchemaResult => {
  const properties = getNamedProperties(schema) ?? {};
  const ownRequiredNames = new Set(getRequiredPropertyNames(schema));
  const requiredProperties: JsonSchemaRecord = {};
  const optionalProperties: JsonSchemaRecord = {};
  const requiredNames: string[] = [];

  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    if (!isJsonSchemaRecord(propertySchema)) {
      continue;
    }

    const isRequiredHere =
      ownRequiredNames.has(propertyName) ||
      (isRoot && propertyName === "args" && isArrayFieldRequired(propertySchema));

    if (isRequiredHere) {
      requiredProperties[propertyName] = propertySchema;
      requiredNames.push(propertyName);
      continue;
    }

    if (isSplittableObjectSchema(propertySchema)) {
      const childSplit = splitSchemaByRequired(propertySchema);

      if (childSplit.requiredSchema) {
        requiredProperties[propertyName] = childSplit.requiredSchema;
        requiredNames.push(propertyName);
      }
      if (childSplit.optionalSchema) {
        optionalProperties[propertyName] = childSplit.optionalSchema;
      }
      continue;
    }

    if (getRequiredPropertyNames(propertySchema).length > 0) {
      requiredProperties[propertyName] = propertySchema;
      requiredNames.push(propertyName);
      continue;
    }

    optionalProperties[propertyName] = propertySchema;
  }

  return {
    requiredSchema: buildObjectSubsetSchema(schema, requiredProperties, requiredNames),
    optionalSchema: buildObjectSubsetSchema(schema, optionalProperties),
  };
};

export const hasJsonSchemaProperties = (schema: JsonSchemaRecord | null | undefined): boolean => {
  return (
    !!schema && isJsonSchemaRecord(schema.properties) && Object.keys(schema.properties).length > 0
  );
};

export const omitExtraFormDataBySchema = <T extends Record<string, unknown>>(
  formData: T,
  jsonSchema: JsonSchemaRecord | null | undefined
): T => {
  if (!isJsonSchemaRecord(jsonSchema) || Object.keys(jsonSchema).length === 0) {
    return formData;
  }

  const pruned = omitExtraData(
    rjsfValidator,
    jsonSchema as RJSFSchema,
    jsonSchema as RJSFSchema,
    formData
  );

  if (pruned && typeof pruned === "object" && !Array.isArray(pruned)) {
    return pruned as T;
  }

  return formData;
};

type JsonFormDataSource =
  | {
      state?: {
        formData?: unknown;
      };
    }
  | null
  | undefined;

export const readJsonFormData = <T extends Record<string, unknown>>(
  form: JsonFormDataSource,
  fallback: T
): T => {
  const formStateData = form?.state?.formData;
  if (formStateData && typeof formStateData === "object" && !Array.isArray(formStateData)) {
    return formStateData as T;
  }
  return fallback;
};

export const getPrunedJsonFormData = <T extends Record<string, unknown>>(
  form: JsonFormDataSource,
  fallback: T,
  jsonSchema: JsonSchemaRecord | null | undefined
): T => omitExtraFormDataBySchema(readJsonFormData(form, fallback), jsonSchema);

const HIDDEN_UI_WIDGET = "hidden";

const hasHiddenDescendants = (
  propertySchema: JsonSchemaRecord,
  visibleProperty: JsonSchemaRecord
): boolean => {
  const fullProperties = getNamedProperties(propertySchema);
  const visibleProperties = getNamedProperties(visibleProperty);
  if (!fullProperties || !visibleProperties) {
    return false;
  }

  for (const [propertyName, fullChild] of Object.entries(fullProperties)) {
    const visibleChild = visibleProperties[propertyName];
    if (!isJsonSchemaRecord(visibleChild)) {
      return true;
    }
    if (isJsonSchemaRecord(fullChild) && hasHiddenDescendants(fullChild, visibleChild)) {
      return true;
    }
  }

  return false;
};

const hideOmittedProperties = (
  schema: JsonSchemaRecord,
  visibleSchema: JsonSchemaRecord | null,
  uiSchema: UiSchemaRecord
): UiSchemaRecord => {
  const properties = getNamedProperties(schema) ?? {};
  const visibleProperties = (visibleSchema && getNamedProperties(visibleSchema)) ?? {};
  const result: UiSchemaRecord = { ...uiSchema };

  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    const propertyUiSchema = isJsonSchemaRecord(uiSchema[propertyName])
      ? uiSchema[propertyName]
      : {};
    const visibleProperty = visibleProperties[propertyName];

    if (!isJsonSchemaRecord(visibleProperty)) {
      result[propertyName] = { ...propertyUiSchema, "ui:widget": HIDDEN_UI_WIDGET };
      continue;
    }

    if (
      isJsonSchemaRecord(propertySchema) &&
      hasHiddenDescendants(propertySchema, visibleProperty)
    ) {
      result[propertyName] = hideOmittedProperties(
        propertySchema,
        visibleProperty,
        propertyUiSchema
      );
    }
  }

  return result;
};

export const getJobParamsSchemaLayout = (
  jsonSchema: JsonSchemaRecord | null | undefined,
  uiSchema: UiSchemaRecord | null | undefined,
  isAdvancedSettingsEnabled: boolean
): JobParamsSchemaLayout => {
  if (!hasJsonSchemaProperties(jsonSchema)) {
    if (isJsonSchemaRecord(jsonSchema)) {
      return {
        displaySchema: jsonSchema,
        displayUiSchema: uiSchema ?? undefined,
        visibleSchema: jsonSchema,
      };
    }

    return {
      displaySchema: null,
      displayUiSchema: undefined,
      visibleSchema: null,
    };
  }

  if (isAdvancedSettingsEnabled) {
    return {
      displaySchema: jsonSchema,
      displayUiSchema: uiSchema ?? undefined,
      visibleSchema: jsonSchema,
    };
  }

  const split = splitSchemaByRequired(jsonSchema, true);

  return {
    displaySchema: jsonSchema,
    displayUiSchema: hideOmittedProperties(jsonSchema, split.requiredSchema, uiSchema ?? {}),
    visibleSchema: split.requiredSchema,
  };
};

const POSITIONAL_ARGS_PROPERTY_NAMES = ["args", "arg"];

const omitRootProperties = (
  schema: JsonSchemaRecord | null,
  propertyNames: string[]
): JsonSchemaRecord | null => {
  if (!schema || !isJsonSchemaRecord(schema.properties)) {
    return schema;
  }

  const properties = Object.fromEntries(
    Object.entries(schema.properties).filter(([name]) => !propertyNames.includes(name))
  );
  const required = getRequiredPropertyNames(schema).filter((name) => !propertyNames.includes(name));

  return buildObjectSubsetSchema(schema, properties, required);
};

export const getOptionalJobParamsSchemaLayout = (
  jsonSchema: JsonSchemaRecord | null | undefined,
  uiSchema: UiSchemaRecord | null | undefined
): JobParamsSchemaLayout => {
  if (!hasJsonSchemaProperties(jsonSchema)) {
    return {
      displaySchema: null,
      displayUiSchema: undefined,
      visibleSchema: null,
    };
  }

  const split = splitSchemaByRequired(jsonSchema, true);
  const optionalSchema = omitRootProperties(split.optionalSchema, POSITIONAL_ARGS_PROPERTY_NAMES);

  return {
    displaySchema: optionalSchema,
    displayUiSchema: uiSchema ?? undefined,
    visibleSchema: optionalSchema,
  };
};

const allowExtraFormDataInSubsetSchema = (schema: JsonSchemaRecord): JsonSchemaRecord => {
  const properties = schema.properties;
  const additionalProperties = isJsonSchemaRecord(schema.additionalProperties)
    ? schema.additionalProperties
    : true;

  if (!isJsonSchemaRecord(properties)) {
    return { ...schema, additionalProperties };
  }

  return {
    ...schema,
    additionalProperties,
    properties: Object.fromEntries(
      Object.entries(properties).map(([name, propertySchema]) => {
        if (
          !isJsonSchemaRecord(propertySchema) ||
          (propertySchema.type !== "object" &&
            !isJsonSchemaRecord(propertySchema.properties) &&
            propertySchema.additionalProperties === undefined)
        ) {
          return [name, propertySchema];
        }
        return [name, allowExtraFormDataInSubsetSchema(propertySchema)];
      })
    ),
  };
};

const SCHEMA_COMBINATOR_KEYS = ["oneOf", "anyOf", "allOf"] as const;

const getValidationPathSegments = (propertyPath: string): string[] => {
  const trimmed = propertyPath.trim();
  if (!trimmed) {
    return [];
  }
  const normalized = trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
  return normalized
    .slice(1)
    .split(/\.|\[|\]/)
    .filter((segment) => segment !== "");
};

const getCombinatorBranches = (schema: JsonSchemaRecord): JsonSchemaRecord[] =>
  SCHEMA_COMBINATOR_KEYS.flatMap((key) => {
    const value = schema[key];
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter(isJsonSchemaRecord);
  });

const getConditionalBranches = (schema: JsonSchemaRecord): JsonSchemaRecord[] => {
  const branches: JsonSchemaRecord[] = [];

  const dependencies = schema.dependencies;
  if (isJsonSchemaRecord(dependencies)) {
    for (const dependencySchema of Object.values(dependencies)) {
      if (isJsonSchemaRecord(dependencySchema)) {
        branches.push(dependencySchema);
      }
    }
  }

  const dependentSchemas = schema.dependentSchemas;
  if (isJsonSchemaRecord(dependentSchemas)) {
    for (const dependentSchema of Object.values(dependentSchemas)) {
      if (isJsonSchemaRecord(dependentSchema)) {
        branches.push(dependentSchema);
      }
    }
  }

  for (const key of ["then", "else"] as const) {
    const branch = schema[key];
    if (isJsonSchemaRecord(branch)) {
      branches.push(branch);
    }
  }

  return branches;
};

const getAlternativeSchemaBranches = (schema: JsonSchemaRecord): JsonSchemaRecord[] => [
  ...getCombinatorBranches(schema),
  ...getConditionalBranches(schema),
];

const isValidationPathHiddenInSchema = (schema: JsonSchemaRecord, segments: string[]): boolean => {
  if (segments.length === 0) {
    return false;
  }

  const [segment, ...rest] = segments;

  if (/^\d+$/.test(segment)) {
    const items = schema.items;
    if (isJsonSchemaRecord(items)) {
      return isValidationPathHiddenInSchema(items, rest);
    }
    if (Array.isArray(items)) {
      const itemSchema = items[Number(segment)];
      if (isJsonSchemaRecord(itemSchema)) {
        return isValidationPathHiddenInSchema(itemSchema, rest);
      }
    }

    const alternativeBranches = getAlternativeSchemaBranches(schema);
    if (alternativeBranches.length > 0) {
      return alternativeBranches.every((branch) =>
        isValidationPathHiddenInSchema(branch, segments)
      );
    }

    return false;
  }

  const properties = getNamedProperties(schema);
  const child = properties?.[segment];
  if (isJsonSchemaRecord(child)) {
    return isValidationPathHiddenInSchema(child, rest);
  }

  const additionalProperties = schema.additionalProperties;
  if (isJsonSchemaRecord(additionalProperties)) {
    return isValidationPathHiddenInSchema(additionalProperties, rest);
  }

  const alternativeBranches = getAlternativeSchemaBranches(schema);
  if (alternativeBranches.length > 0) {
    return alternativeBranches.every((branch) => isValidationPathHiddenInSchema(branch, segments));
  }

  return properties !== null && additionalProperties !== true;
};

const hasHiddenValidationErrors = (
  errors: { property?: string }[],
  visibleSchema: JsonSchemaRecord | null | undefined
): boolean => {
  if (!visibleSchema) {
    return false;
  }
  return errors.some((error) => {
    const segments = getValidationPathSegments(error.property ?? "");
    return segments.length > 0 && isValidationPathHiddenInSchema(visibleSchema, segments);
  });
};

const validateFormDataWithSchema = (
  formData: Record<string, unknown>,
  schema: JsonSchemaRecord,
  uiSchema?: UiSchemaRecord
) =>
  rjsfValidator.validateFormData(
    formData,
    schema as RJSFSchema,
    undefined,
    undefined,
    uiSchema as UiSchemaRecord
  );

export type JobJsonFormValidationResult =
  | { ok: true }
  | { ok: false; openAdvanced: true }
  | { ok: false; useFormRef: true };

export const validateJobJsonFormData = (
  formData: Record<string, unknown>,
  jsonSchema: JsonSchemaRecord | undefined,
  uiSchema: UiSchemaRecord | undefined,
  isAdvancedSettingsEnabled: boolean,
  visibleSchema: JsonSchemaRecord | null | undefined
): JobJsonFormValidationResult => {
  if (!hasJsonSchemaProperties(visibleSchema)) {
    if (isAdvancedSettingsEnabled || !jsonSchema || !hasJsonSchemaProperties(jsonSchema)) {
      return { ok: true };
    }

    const { errors } = validateFormDataWithSchema(formData, jsonSchema, uiSchema);

    return errors.length > 0 ? { ok: false, openAdvanced: true } : { ok: true };
  }

  if (jsonSchema && hasJsonSchemaProperties(jsonSchema)) {
    const { errors: fullErrors } = validateFormDataWithSchema(formData, jsonSchema, uiSchema);
    if (
      fullErrors.length > 0 &&
      !isAdvancedSettingsEnabled &&
      hasHiddenValidationErrors(fullErrors, visibleSchema)
    ) {
      return { ok: false, openAdvanced: true };
    }

    if (isAdvancedSettingsEnabled) {
      return fullErrors.length > 0 ? { ok: false, useFormRef: true } : { ok: true };
    }
  }

  const validationSchema = visibleSchema ? allowExtraFormDataInSubsetSchema(visibleSchema) : null;
  if (!validationSchema) {
    return { ok: true };
  }

  const { errors } = validateFormDataWithSchema(formData, validationSchema, uiSchema);

  // Visible-field errors: let the mounted JsonForm validateForm() so RJSF
  // focusOnFirstError runs.
  if (errors.length > 0) {
    return { ok: false, useFormRef: true };
  }

  return { ok: true };
};
