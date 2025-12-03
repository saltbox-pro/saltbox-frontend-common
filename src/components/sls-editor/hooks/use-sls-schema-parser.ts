import { useState, useEffect } from "react";
import type { FormSchema } from "../types";
import { parseSchemaFromSls, getEmptySchema } from "../utils/sls-parser";
import { isValidSchema } from "../utils/schema-validator";

/**
 * Hook for parsing schema from SLS with error handling
 *
 * @param sls - SLS content with embedded schema
 * @returns Object with parsed schema and possible error
 *
 * @example
 * ```tsx
 * const { schema, error } = useSlsSchemaParser(sls);
 *
 * if (error) {
 *   return <Alert type="error" message={error} />;
 * }
 *
 * return <FormEditor schema={schema} />;
 * ```
 */
export function useSlsSchemaParser(sls?: string) {
  const [schema, setSchema] = useState<FormSchema>(getEmptySchema());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sls) {
      setSchema(getEmptySchema());
      setError(null);
      return;
    }

    try {
      const parsed = parseSchemaFromSls(sls);

      if (!isValidSchema(parsed.json_schema)) {
        throw new Error("Invalid JSON Schema structure");
      }

      setSchema(parsed);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setSchema(getEmptySchema());
    }
  }, [sls]);

  return { schema, error };
}
