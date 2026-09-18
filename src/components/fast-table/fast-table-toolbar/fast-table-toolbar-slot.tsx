import { type PropsWithChildren, useContext } from "react";

import { FastTableToolbarSlotContext } from "./fast-table-toolbar-slot-context";
import { useFastTableToolbarSlotState } from "./use-fast-table-toolbar-slot-state";

import "./fast-table-toolbar-slot.css";

export type FastTableToolbarSlotProviderProps = PropsWithChildren;

export function FastTableToolbarSlotProvider({ children }: FastTableToolbarSlotProviderProps) {
  const value = useFastTableToolbarSlotState();

  return (
    <FastTableToolbarSlotContext.Provider value={value}>
      {children}
    </FastTableToolbarSlotContext.Provider>
  );
}

export function FastTableToolbarSlot() {
  const slot = useContext(FastTableToolbarSlotContext);

  return <div ref={slot?.setNode} className="fast-table-toolbar-slot" />;
}
