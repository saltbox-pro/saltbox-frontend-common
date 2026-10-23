import zIndexContext from "antd/es/_util/zindexContext";
import DrawerContext from "rc-drawer/es/context";
import { type PropsWithChildren, useContext, useMemo } from "react";

export type ParentDrawerBridge = {
  pushDistance?: number | string;
  push: () => void;
  pull: () => void;
  zIndex?: number;
};

export function useParentDrawerBridge(): ParentDrawerBridge | null {
  const drawer = useContext(DrawerContext);
  const zIndex = useContext(zIndexContext);
  return useMemo(() => (drawer == null ? null : { ...drawer, zIndex }), [drawer, zIndex]);
}

export function ParentDrawerBridgeProvider({
  value,
  children,
}: PropsWithChildren<{ value: ParentDrawerBridge | null | undefined }>) {
  if (value == null) {
    return children;
  }
  return (
    <zIndexContext.Provider value={value.zIndex}>
      <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
    </zIndexContext.Provider>
  );
}
