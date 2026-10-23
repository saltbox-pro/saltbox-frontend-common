import DrawerContext from "rc-drawer/es/context";
import { type PropsWithChildren, useContext } from "react";

export type ParentDrawerBridge = {
  pushDistance?: number | string;
  push: () => void;
  pull: () => void;
};

export function useParentDrawerBridge(): ParentDrawerBridge | null {
  return useContext(DrawerContext) ?? null;
}

export function ParentDrawerBridgeProvider({
  value,
  children,
}: PropsWithChildren<{ value: ParentDrawerBridge | null | undefined }>) {
  if (value == null) {
    return children;
  }
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}
