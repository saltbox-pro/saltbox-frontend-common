import type {editor as MonacoEditor, IDisposable} from "monaco-editor";
import type {JSONSchema} from "../../types";

/**
 * Extracts root-level pillar parameter names from JSON Schema
 *
 * Navigates through: schema.properties.kwargs.properties.pillar.properties
 *
 * @param schema - JSON Schema (json_schema from FormSchema)
 * @returns Array of parameter names from pillar.properties
 */
export function extractPillarFields(schema: JSONSchema): string[] {
  // Type guard: schema can be false or boolean in JSONSchema7
  if (typeof schema !== "object" || !schema) {
    return [];
  }

  // Navigate to pillar properties: schema.properties.kwargs.properties.pillar.properties
  if (!("properties" in schema) || typeof schema.properties !== "object") {
    return [];
  }

  const props = schema.properties as Record<string, unknown>;

  if (
    !("kwargs" in props) ||
    typeof props.kwargs !== "object" ||
    !props.kwargs
  ) {
    return [];
  }

  const kwargs = props.kwargs as Record<string, unknown>;

  if (!("properties" in kwargs) || typeof kwargs.properties !== "object") {
    return [];
  }

  const kwargsProps = kwargs.properties as Record<string, unknown>;

  if (
    !("pillar" in kwargsProps) ||
    typeof kwargsProps.pillar !== "object" ||
    !kwargsProps.pillar
  ) {
    return [];
  }

  const pillar = kwargsProps.pillar as Record<string, unknown>;

  if (!("properties" in pillar) || typeof pillar.properties !== "object") {
    return [];
  }

  return Object.keys(pillar.properties as Record<string, unknown>);
}

/**
 * Registers context menu in Monaco Editor for inserting Jinja2 pillar templates
 *
 * Menu structure:
 * ```
 * Right Click →
 *   Insert Pillar...
 * ```
 *
 * Clicking opens a modal for selecting parameter and template type
 *
 * @param editor - Monaco editor instance
 * @param monaco - Monaco module
 * @param schema - JSON Schema containing pillar parameters
 * @param onOpenModal - Callback to open the modal with available fields
 * @returns Disposable object to cleanup menu registrations
 */
export function registerContextMenu(
  editor: MonacoEditor.IStandaloneCodeEditor,
  monaco: typeof import("monaco-editor"),
  schema: JSONSchema,
  onOpenModal: (fields: string[]) => void,
): IDisposable {
  const pillarFields = extractPillarFields(schema);

  // If no fields, don't register menu
  if (pillarFields.length === 0) {
    return {
      dispose: () => {
        // No-op
      },
    };
  }

  // Register single action that opens modal in separate group
  const actionId = "insertPillar.openModal";
  return editor.addAction({
    id: actionId,
    label: "Insert Pillar...",
    contextMenuGroupId: "insertPillar", // Separate group for pillar operations
    contextMenuOrder: 1,
    run: () => {
      onOpenModal(pillarFields);
    },
  });
}

/**
 * Inserts text at current cursor position in Monaco Editor
 *
 * @param editor - Monaco editor instance
 * @param text - Text to insert
 */
export function insertTextAtCursor(
  editor: MonacoEditor.IStandaloneCodeEditor,
  text: string,
): void {
  const selection = editor.getSelection();
  if (!selection) return;

  const id = { major: 1, minor: 1 };
  const op = {
    identifier: id,
    range: selection,
    text: text,
    forceMoveMarkers: true,
  };

  editor.executeEdits("context-menu", [op]);

  // Move cursor to end of inserted text
  const position = selection.getStartPosition();
  const newPosition = position.delta(0, text.length);
  editor.setPosition(newPosition);
  editor.focus();
}
