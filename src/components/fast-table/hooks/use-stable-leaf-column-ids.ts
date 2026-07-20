import { useRef } from "react";

export function useStableLeafColumnIds(leafColumns: Array<{ id: string }>): {
  leafColumnIds: string[];
  leafColumnIdsKey: string;
} {
  const leafColumnIdsKey = leafColumns.map((column) => column.id).join("\0");
  const cacheRef = useRef<{ key: string; ids: string[] }>({ key: "", ids: [] });

  if (cacheRef.current.key !== leafColumnIdsKey) {
    cacheRef.current = {
      key: leafColumnIdsKey,
      ids: leafColumns.map((column) => column.id),
    };
  }

  return {
    leafColumnIds: cacheRef.current.ids,
    leafColumnIdsKey,
  };
}
