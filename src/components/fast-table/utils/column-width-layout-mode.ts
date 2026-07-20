export type ColumnWidthLayoutMode = "idle" | "seeded" | "dragging" | "persisted";

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
  if (args.hasSizing) {
    return "seeded";
  }
  return "idle";
}

export function isColumnWidthLocked(mode: ColumnWidthLayoutMode): boolean {
  return mode !== "idle";
}
