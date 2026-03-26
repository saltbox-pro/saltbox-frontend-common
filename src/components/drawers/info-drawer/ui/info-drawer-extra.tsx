import { Skeleton } from "antd";

import type { DrawerProps } from "saltbox-common/components/antd-wrappers/drawer";

import { InfoDrawerLink, type InfoDrawerLinkProps } from "./info-drawer-link";

interface InfoDrawerExtraProps extends InfoDrawerLinkProps, Pick<DrawerProps, "extra"> {
  loading?: boolean;
}

export function InfoDrawerExtra({ loading, extra, ...restProps }: InfoDrawerExtraProps) {
  return (
    <>
      {loading ? (
        <Skeleton.Button active size="small" style={{ width: 24, minWidth: 24 }} />
      ) : (
        <>
          {extra} <InfoDrawerLink {...restProps} />
        </>
      )}
    </>
  );
}
