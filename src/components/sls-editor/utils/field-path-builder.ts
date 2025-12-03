import type { JSONSchema } from "../types";

/**
 * Build field path from parts
 *
 * @param parts - Array of path parts
 * @returns Joined path string
 *
 * @example
 * ```ts
 * buildFieldPath(['person', 'address', 'city'])
 * // Returns: 'person.address.city'
 * ```
 */
export function buildFieldPath(parts: string[]): string {
  return parts.join(".");
}

/**
 * Build Jinja variable from field path
 *
 * @param fieldPath - Field path (e.g., 'person.name')
 * @returns Jinja variable string
 *
 * @example
 * ```ts
 * buildJinjaVariable('person.name')
 * // Returns: '{{ pillar.person.name }}'
 * ```
 */
export function buildJinjaVariable(fieldPath: string): string {
  return `{{ pillar.${fieldPath} }}`;
}

/**
 * Extract field paths from schema properties recursively
 * Handles nested objects and returns flat list of dot-notation paths
 *
 * @param properties - Schema properties object
 * @param prefix - Current path prefix (for recursion)
 * @returns Array of field paths
 *
 * @example
 * ```ts
 * const properties = {
 *   name: { type: 'string' },
 *   address: {
 *     type: 'object',
 *     properties: {
 *       city: { type: 'string' },
 *       country: { type: 'string' }
 *     }
 *   }
 * };
 *
 * extractFieldPaths(properties)
 * // Returns: ['name', 'address.city', 'address.country']
 * ```
 */
export function extractFieldPaths(
  properties: Record<string, JSONSchema>,
  prefix = "",
): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(properties)) {
    const path = prefix ? `${prefix}.${key}` : key;

    // Check if value is an object (not boolean) and has properties
    if (
      typeof value === "object" &&
      value !== null &&
      value.type === "object" &&
      value.properties &&
      typeof value.properties === "object"
    ) {
      // Recursively traverse nested objects
      paths.push(
        ...extractFieldPaths(
          value.properties as Record<string, JSONSchema>,
          path,
        ),
      );
    } else {
      // Leaf node - add to list
      paths.push(path);
    }
  }

  return paths;
}
