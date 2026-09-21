import { type ReactNode, createContext, useContext, useRef, useSyncExternalStore } from "react";

import {
  createFastTableToolbarStore,
  type FastTableToolbarStore,
  subscribeNoop,
} from "./fast-table-toolbar-store";

const FastTableToolbarContext = createContext<FastTableToolbarStore | null>(null);

export function FastTableProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<FastTableToolbarStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createFastTableToolbarStore();
  }

  return (
    <FastTableToolbarContext.Provider value={storeRef.current}>
      {children}
    </FastTableToolbarContext.Provider>
  );
}

export function useFastTableToolbarStore() {
  return useContext(FastTableToolbarContext);
}

export function useHasExternalToolbar() {
  const store = useFastTableToolbarStore();
  return useSyncExternalStore(
    store?.subscribe ?? subscribeNoop,
    () => store?.getHasExternalToolbar() ?? false,
    () => false
  );
}

export function useFastTableToolbarModel() {
  const store = useFastTableToolbarStore();
  return useSyncExternalStore(
    store?.subscribe ?? subscribeNoop,
    () => store?.getModel() ?? null,
    () => null
  );
}
