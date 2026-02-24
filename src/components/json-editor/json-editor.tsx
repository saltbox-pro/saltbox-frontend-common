import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { type FC, useCallback, useMemo } from "react";

type EditorOptions = editor.IStandaloneEditorConstructionOptions;

const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  lineNumbers: "on",
  tabSize: 2,
  insertSpaces: true,
  automaticLayout: true,
  suggest: {
    showProperties: false,
  },
} as const;

export interface JsonEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number | string;
  disabled?: boolean;
  className?: string;
  editorOptions?: Partial<EditorOptions>;
}

export const JsonEditor: FC<JsonEditorProps> = ({
  value = "",
  onChange,
  height = 260,
  disabled = false,
  className,
  editorOptions,
}) => {
  const handleChange = useCallback(
    (newValue: string | undefined) => {
      onChange?.(newValue ?? "");
    },
    [onChange]
  );

  const options = useMemo(
    () => ({
      ...DEFAULT_EDITOR_OPTIONS,
      ...editorOptions,
      readOnly: disabled,
      contextmenu: !disabled,
    }),
    [editorOptions, disabled]
  );

  return (
    <Editor
      className={className}
      height={height}
      language="json"
      value={value}
      onChange={handleChange}
      options={options}
    />
  );
};
