import { createContext } from "react";

export type FastTableToolbarSlotContextValue = {
  node: HTMLElement | null;
  setNode: (node: HTMLElement | null) => void;
  claim: (owner: string) => boolean;
  release: (owner: string) => void;
};

export const FastTableToolbarSlotContext = createContext<FastTableToolbarSlotContextValue | null>(
  null
);
