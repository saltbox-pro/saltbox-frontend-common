//@ts-ignore
import type {
  JSONSchema,
  UISchema,
  FormSchema,
} from "@saltbox/react-jsonschema-form-generator";

// Re-export types for convenience
export type { JSONSchema, UISchema, FormSchema };

/**
 * Additional tab for SlsEditor
 *
 * @example
 * ```tsx
 * const additionalTabs = [
 *   {
 *     key: 'preview',
 *     title: 'Preview',
 *     content: <PreviewComponent />
 *   }
 * ];
 * ```
 */
export interface SlsEditorTab {
  /** Unique tab key */
  key: string;
  /** Tab display title */
  title: string;
  /** Tab content */
  content: React.ReactNode;
}

/**
 * Props for SlsEditor component
 *
 * @example
 * ```tsx
 * <SlsEditor
 *   sls={slsContent}
 *   onSlsChange={(newSls) => console.log(newSls)}
 *   defaultTab="form-editor"
 * />
 * ```
 */
export interface SlsEditorProps {
  /**
   * SLS content with embedded schema in format:
   * {#start_schema
   * {
   *   "json_schema": {...},
   *   "ui_schema": {...}
   * }
   * end_schema#}
   * {% Jinja2 + YAML content %}
   */
  sls?: string;

  /**
   * Callback when SLS changes (including schema changes)
   */
  onSlsChange?: (sls: string) => void;

  /**
   * Additional custom tabs
   */
  additionalTabs?: SlsEditorTab[];

  /**
   * Default tab key ('form-editor' | 'sls-editor' | custom key)
   * @default 'form-editor'
   */
  defaultTab?: string;

  /**
   * CSS class for customization
   */
  className?: string;
}

/**
 * Field menu item for context menu
 */
export interface FieldMenuItem {
  /** Unique field key */
  key: string;
  /** Display label */
  label: string;
  /** Field path (e.g., 'person.name', 'person.address.city') */
  path: string;
}
