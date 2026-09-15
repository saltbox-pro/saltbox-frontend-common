import { useCallback, useMemo, useRef, useState } from "react";

import type { FastTableToolbarSlotValue } from "./fast-table-toolbar-slot-context";

export function useFastTableToolbarSlotState(
  container?: HTMLElement | null
): FastTableToolbarSlotValue {
  const [ownNode, setNode] = useState<HTMLElement | null>(null);
  const ownerRef = useRef<string | null>(null);
  const node = container === undefined ? ownNode : container;

  const claim = useCallback((owner: string) => {
    if (ownerRef.current !== null && ownerRef.current !== owner) {
      return false;
    }

    ownerRef.current = owner;
    return true;
  }, []);

  const release = useCallback((owner: string) => {
    if (ownerRef.current === owner) {
      ownerRef.current = null;
    }
  }, []);

  return useMemo(() => ({ node, setNode, claim, release }), [node, claim, release]);
}
