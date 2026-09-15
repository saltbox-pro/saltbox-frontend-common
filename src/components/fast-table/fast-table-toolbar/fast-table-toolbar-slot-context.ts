import { createContext } from "react";

export type FastTableToolbarSlotValue = {
  node: HTMLElement | null;
  setNode: (node: HTMLElement | null) => void;
  claim: (owner: string) => boolean;
  release: (owner: string) => void;
};

export const FastTableToolbarSlotContext = createContext<FastTableToolbarSlotValue | null>(null);
