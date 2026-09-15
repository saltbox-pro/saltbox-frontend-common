import { useContext, useId, useLayoutEffect, useState } from "react";

import { FastTableToolbarSlotContext } from "./fast-table-toolbar-slot-context";

export function useFastTableToolbarContainer() {
  const slot = useContext(FastTableToolbarSlotContext);
  const owner = useId();
  const [isOwner, setIsOwner] = useState(false);
  const claim = slot?.claim;
  const release = slot?.release;

  useLayoutEffect(() => {
    if (!claim || !release) {
      return;
    }

    setIsOwner(claim(owner));
    return () => release(owner);
  }, [claim, release, owner]);

  return isOwner ? (slot?.node ?? null) : null;
}
