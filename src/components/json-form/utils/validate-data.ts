import Ajv, { type Options, type JSONSchemaType, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

import { AJV_TIME_WITH_OPTIONAL_TIMEZONE_REGEXP } from "../constants/regexp";

export function createAjvValidator(options?: Options): Ajv {
  const ajv = new Ajv(options);
  addFormats(ajv);
  // ajv-formats v3 validates format: "time" as RFC3339 full-time (often requiring timezone).
  // UI (antd) produces local time like "14:14:00", so we allow timezone to be optional.
  ajv.addFormat("time", AJV_TIME_WITH_OPTIONAL_TIMEZONE_REGEXP);
  return ajv;
}

export const defaultAjvValidator = createAjvValidator();

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map((err) => {
    const path = err.instancePath || "/";
    const message = err.message || "validation failed";
    const params = err.params ? ` (${JSON.stringify(err.params)})` : "";
    return `${path}: ${message}${params}`;
  });
}

export interface IsValidDataOptions<T> {
  data: T;
  schema: JSONSchemaType<T> | object;
  showWarning?: boolean;
  ajv?: Ajv;
}

export function isValidDataWithAjv<T = unknown>({
  data,
  schema,
  showWarning,
  ajv = defaultAjvValidator,
}: IsValidDataOptions<T>): boolean {
  const validate = ajv.compile(schema);

  if (showWarning) {
    const errorMessages = formatAjvErrors(validate.errors);
    console.warn("Data validation failed:", errorMessages);
  }

  return validate(data);
}
