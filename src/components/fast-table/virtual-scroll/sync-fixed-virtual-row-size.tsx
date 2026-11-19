import type { Virtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef } from "react";

type SyncFixedVirtualRowSizeProps = {
  active: boolean;
  index: number;
  itemKey: string | number;
  size: number;
  rowVirtualizer: Virtualizer<HTMLElement, Element>;
};

export function SyncFixedVirtualRowSize({
  active,
  index,
  itemKey,
  size,
  rowVirtualizer,
}: SyncFixedVirtualRowSizeProps) {
  const wasActiveRef = useRef(active);
  const prevItemKeyRef = useRef<string | number | null>(null);

  useLayoutEffect(() => {
    const keyChanged = prevItemKeyRef.current !== itemKey;
    prevItemKeyRef.current = itemKey;

    const becameActive = active && !wasActiveRef.current;
    wasActiveRef.current = active;

    if (active && (becameActive || keyChanged)) {
      rowVirtualizer.resizeItem(index, size);
    }
  }, [active, index, itemKey, rowVirtualizer, size]);

  return null;
}
