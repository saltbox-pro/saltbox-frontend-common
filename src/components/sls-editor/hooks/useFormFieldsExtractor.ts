import { useMemo } from "react";
import type { JSONSchema } from "../types";
import { extractFieldPaths } from "../utils/fieldPathBuilder";

/**
 * Hook for extracting fields from JSON Schema
 *
 * Extracts all fields from pillar.properties schema for use
 * in context menus, autocomplete, etc.
 *
 * @param schema - JSON Schema with kwargs.pillar structure
 * @returns Array of field paths (e.g., ["name", "profile.email", "profile.address.city"])
 *
 * @example
 * ```tsx
 * const fields = useFormFieldsExtractor(schema);
 * // Result: ["username", "profile.firstName", "profile.address.city"]
 *
 * // Usage in context menu
 * fields.map(field => ({
 *   label: field,
 *   onClick: () => insertText(`{{ pillar.${field} }}`)
 * }))
 * ```
 */
export function useFormFieldsExtractor(schema: JSONSchema) {
  return useMemo(() => {
    if (typeof schema === "boolean") {
      return [];
    }

    // Check for kwargs.pillar.properties structure
    const kwargs = schema?.properties?.kwargs;
    if (!kwargs || typeof kwargs !== "object") {
      return [];
    }

    const pillar = kwargs.properties?.pillar;
    if (!pillar || typeof pillar !== "object") {
      return [];
    }

    const pillarProperties = pillar.properties;
    if (!pillarProperties || typeof pillarProperties !== "object") {
      return [];
    }

    // Recursively extract all field paths
    return extractFieldPaths(pillarProperties as Record<string, JSONSchema>);
  }, [schema]);
}
