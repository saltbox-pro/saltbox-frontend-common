import {
  type ComponentType,
  type Key,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Drawer, type DrawerProps } from "saltbox-common/components/antd-wrappers/drawer";
import type { ResourceLoadError } from "saltbox-common/components/http-error";
import { SwitchTransitionLayout } from "saltbox-common/components/transition-layout";

import { InfoDrawerError } from "./info-drawer-error";
import { InfoDrawerExtra } from "./info-drawer-extra";
import { InfoDrawerLoader } from "./info-drawer-loader";
import { InfoDrawerTitle } from "./info-drawer-title";
import styles from "./info-drawer.module.css";

export interface InfoDrawerProps extends PropsWithChildren, Omit<DrawerProps, "title"> {
  drawerId: string;
  titleName?: string;
  titleLabel?: string;
  titleCopyable?: boolean;
  linkTo?: string;
  linkTitle?: string;
  linkComponent?: ComponentType<{ to: string; children: ReactNode }>;
  loadError?: ResourceLoadError | null;
  onRetry?: () => void;
  hasData?: boolean;
  transitionKey?: Key;
  onClose: () => void;
}

export function InfoDrawer({
  drawerId,
  transitionKey,
  open,
  titleName,
  titleLabel,
  titleCopyable = true,
  linkTo,
  linkTitle,
  linkComponent,
  loadError,
  onRetry,
  loading,
  size = "large",
  placement = "right",
  mask = false,
  rootClassName,
  extra,
  hasData = true,
  destroyOnHidden = true,
  width = 770,
  onClose,
  children,
  classNames,
  ...restProps
}: InfoDrawerProps) {
  const onCloseRef = useRef(onClose);
  const layoutAnchorRef = useRef<HTMLDivElement>(null);

  const hasError = !loading && !!loadError;
  const activeKey = useMemo(
    () => transitionKey ?? (hasError ? "error" : hasData ? "content" : "empty"),
    [hasData, hasError, transitionKey]
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const resetDrawerBodyScroll = useCallback(() => {
    if (!open) {
      return;
    }

    const drawerBody = layoutAnchorRef.current?.closest<HTMLElement>(".ant-drawer-body");
    if (drawerBody) {
      drawerBody.scrollTop = 0;
    }
  }, [open]);

  useEffect(() => {
    return () => {
      onCloseRef.current();
    };
  }, []);

  return (
    <Drawer
      id={`sbx-drawer-${drawerId}`}
      rootClassName={`${styles.drawer} ${rootClassName ?? ""}`}
      classNames={{
        ...classNames,
        header: `${styles.header} ${classNames?.header ?? ""}`,
        body: `${styles.body} ${classNames?.body ?? ""}`,
      }}
      open={open}
      size={size}
      placement={placement}
      title={
        <InfoDrawerTitle
          activeTransitionKey={open ? "opened" : "closed"}
          name={titleName}
          label={titleLabel}
          copyable={titleCopyable}
        />
      }
      extra={
        <InfoDrawerExtra
          extra={extra}
          to={linkTo}
          title={linkTitle}
          linkComponent={linkComponent}
          loading={loading}
        />
      }
      mask={mask}
      width={width}
      destroyOnHidden={destroyOnHidden}
      onClose={onClose}
      {...restProps}
    >
      <InfoDrawerLoader loading={loading} />

      <div ref={layoutAnchorRef} className={styles.layoutAnchor}>
        <SwitchTransitionLayout
          className={styles.layout}
          activeKey={activeKey}
          onEnter={resetDrawerBodyScroll}
        >
          {() => (
            <div className={styles.content}>
              {hasError && loadError ? (
                <InfoDrawerError error={loadError} onRetry={onRetry} />
              ) : hasData ? (
                children
              ) : null}
            </div>
          )}
        </SwitchTransitionLayout>
      </div>
    </Drawer>
  );
}
