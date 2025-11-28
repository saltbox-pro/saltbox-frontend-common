import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validate JSON Schema for correctness
 *
 * @param schema - Schema object to validate
 * @returns Validation result with errors if any
 *
 * @example
 * ```ts
 * const result = validateJSONSchema(mySchema);
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function validateJSONSchema(schema: unknown): {
  valid: boolean;
  errors: string[];
} {
  try {
    // Check basic structure
    if (typeof schema !== "object" || schema === null) {
      return { valid: false, errors: ["Schema must be an object"] };
    }

    // Validate through AJV (JSON Schema Draft 7)
    const validate = ajv.compile({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
    });

    const valid = validate(schema);

    if (!valid && validate.errors) {
      return {
        valid: false,
        errors: validate.errors.map(
          (err) => `${err.instancePath} ${err.message}`,
        ),
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Check if schema is valid (shorthand)
 *
 * @param schema - Schema to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * if (isValidSchema(schema)) {
 *   // proceed
 * }
 * ```
 */
export function isValidSchema(schema: unknown): boolean {
  return validateJSONSchema(schema).valid;
}
