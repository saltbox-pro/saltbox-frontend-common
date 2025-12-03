// Main component
export { SlsEditor } from "./sls-editor";

// Types
export type {
  SlsEditorProps,
  SlsEditorTab,
  FormSchema,
  JSONSchema,
  UISchema,
  FieldMenuItem,
} from "./types";

// Utility functions
export {
  parseSchemaFromSls,
  extractSlsBody, // v2
  combineSchemaAndBody, // v2
  updateSchemaInSls, // @deprecated - use combineSchemaAndBody
  getEmptySchema,
  getEmptySlsBody, // v2
  getEmptySls, // @deprecated - use getEmptySlsBody + combineSchemaAndBody
} from "./utils/sls-parser";

export { validateJSONSchema, isValidSchema } from "./utils/schema-validator";

export {
  buildFieldPath,
  buildJinjaVariable,
  extractFieldPaths,
} from "./utils/field-path-builder";

export {
  generateSimplePillarTemplate,
  generateFallbackPillarTemplate,
  generatePillarTemplate,
  PillarTemplateType,
} from "./utils/jinja-templates";
