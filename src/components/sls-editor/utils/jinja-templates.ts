/**
 * Utilities for generating Jinja2 templates for pillar parameters
 */

/**
 * Generates a simple Jinja2 set statement with pillar.get()
 *
 * Example output:
 * ```jinja2
 * {%- set package_name = pillar.get('package_name') -%}
 * ```
 *
 * @param paramName - The pillar parameter name
 * @returns Formatted Jinja2 template string
 */
export function generateSimplePillarTemplate(paramName: string): string {
  return `{%- set ${paramName} = pillar.get('${paramName}') -%}`;
}

/**
 * Generates a Jinja2 set statement with fallback pillar.get()
 *
 * Example output:
 * ```jinja2
 * {%- set package_name = pillar.get('package_name_', pillar.get('package_name')) -%}
 * ```
 *
 * @param paramName - The pillar parameter name
 * @returns Formatted Jinja2 template string with fallback
 */
export function generateFallbackPillarTemplate(paramName: string): string {
  return `{%- set ${paramName} = pillar.get('${paramName}_', pillar.get('${paramName}')) -%}`;
}

/**
 * Template types for UI labels
 */
export enum PillarTemplateType {
  Simple = "Simple",
  WithFallback = "With fallback",
}

/**
 * Generates pillar template based on type
 *
 * @param paramName - The pillar parameter name
 * @param type - Template type (Simple or WithFallback)
 * @returns Formatted Jinja2 template string
 */
export function generatePillarTemplate(paramName: string, type: PillarTemplateType): string {
  switch (type) {
    case PillarTemplateType.Simple:
      return generateSimplePillarTemplate(paramName);
    case PillarTemplateType.WithFallback:
      return generateFallbackPillarTemplate(paramName);
    default:
      return generateSimplePillarTemplate(paramName);
  }
}
