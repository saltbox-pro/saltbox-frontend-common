import type { DrawerProps } from "saltbox-common/components/antd-wrappers/drawer";

import { InfoDrawerLink, type InfoDrawerLinkProps } from "./info-drawer-link";

interface InfoDrawerExtraProps extends InfoDrawerLinkProps, Pick<DrawerProps, "extra"> {}

export function InfoDrawerExtra({ extra, ...restProps }: InfoDrawerExtraProps) {
  return (
    <>
      {extra} <InfoDrawerLink {...restProps} />
    </>
  );
}
