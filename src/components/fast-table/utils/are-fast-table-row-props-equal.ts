type FastTableRowMemoProps = {
  isResizingColumn: boolean;
  leafColumnIdsKey: string;
  isExpanded: boolean;
  className?: string;
  row: { id: string };
};

export function areFastTableRowPropsEqual<T extends FastTableRowMemoProps>(
  prev: T,
  next: T
): boolean {
  // Outside resize always re-render — MobX may mutate row data in place.
  if (!(prev.isResizingColumn && next.isResizingColumn)) {
    return false;
  }
  return (
    prev.leafColumnIdsKey === next.leafColumnIdsKey &&
    prev.row.id === next.row.id &&
    prev.isExpanded === next.isExpanded &&
    prev.className === next.className
  );
}
