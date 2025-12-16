import Editor, { OnMount } from "@monaco-editor/react";
import React, { useRef, useCallback, useEffect } from "react";

interface SlsMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onMount?: OnMount;
}

/**
 * Monaco Editor for SLS with YAML highlighting and debounce
 *
 * Features:
 * - YAML syntax highlighting
 * - Context menu support
 * - Automatic layout
 * - Cleanup on unmount
 */
export const SlsMonacoEditor: React.FC<SlsMonacoEditorProps> = ({ value, onChange, onMount }) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      onMount?.(editor, monaco);
    },
    [onMount]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Editor
      height="100%"
      language="yaml"
      value={value}
      onChange={onChange}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        lineNumbers: "on",
        tabSize: 2,
        insertSpaces: true,
        contextmenu: true,
        automaticLayout: true,
      }}
      wrapperProps={{
        style: {
          display: "flex",
          position: "relative",
          textAlign: "initial",
          width: "100%",
          height: "100%",
          flex: 1,
        },
      }}
    />
  );
};
