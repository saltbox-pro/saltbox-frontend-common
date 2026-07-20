export type ColumnWidthLayoutMode = "idle" | "dragging" | "persisted";

export function resolveColumnWidthLayoutMode(args: {
  enableColumnResize: boolean;
  hasSizing: boolean;
  hasPersistedSizing: boolean;
  isResizingColumn: boolean;
}): ColumnWidthLayoutMode {
  if (!args.enableColumnResize) {
    return "idle";
  }
  if (args.hasPersistedSizing) {
    return "persisted";
  }
  if (args.isResizingColumn && args.hasSizing) {
    return "dragging";
  }
  return "idle";
}

export function isColumnWidthLocked(mode: ColumnWidthLayoutMode): boolean {
  return mode === "dragging" || mode === "persisted";
}
