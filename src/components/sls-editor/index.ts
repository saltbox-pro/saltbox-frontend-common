// Main component
export { SlsEditor } from "./SlsEditor";

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
} from "./utils/slsParser";

export { validateJSONSchema, isValidSchema } from "./utils/schemaValidator";

export {
  buildFieldPath,
  buildJinjaVariable,
  extractFieldPaths,
} from "./utils/fieldPathBuilder";
