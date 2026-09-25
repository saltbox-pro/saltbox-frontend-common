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
import {
  SwitchTransitionLayout,
  TransitionLayout,
} from "saltbox-common/components/transition-layout";
import { ErrorZone, type LoadSource } from "saltbox-common/error-handling";

import { InfoDrawerError } from "./info-drawer-error";
import { InfoDrawerExtra } from "./info-drawer-extra";
import { InfoDrawerLink } from "./info-drawer-link";
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
  linkPlacement?: "extra" | "title";
  errorMessage?: string | null;
  hasData?: boolean;
  loaders?: readonly LoadSource[];
  transitionKey?: Key;
  fillHeight?: boolean;
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
  linkPlacement = "extra",
  errorMessage,
  loading,
  size = "large",
  placement = "right",
  mask = false,
  rootClassName,
  extra,
  hasData = true,
  loaders,
  destroyOnHidden = true,
  width = 770,
  fillHeight = false,
  onClose,
  children,
  classNames,
  ...restProps
}: InfoDrawerProps) {
  const onCloseRef = useRef(onClose);
  const layoutAnchorRef = useRef<HTMLDivElement>(null);

  const hasError = !loading && !!errorMessage;
  const titleLink =
    linkPlacement === "title" ? (
      <TransitionLayout in={!loading} className={styles.headerActionsFade}>
        <InfoDrawerLink to={linkTo} title={linkTitle} linkComponent={linkComponent} />
      </TransitionLayout>
    ) : null;
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

  const fillClass = fillHeight ? styles.fillChild : "";

  return (
    <Drawer
      id={`sbx-drawer-${drawerId}`}
      rootClassName={`${styles.drawer} ${fillHeight ? styles.fillHeight : ""} ${rootClassName ?? ""}`}
      classNames={{
        ...classNames,
        header: `${styles.header} ${classNames?.header ?? ""}`,
        body: `${styles.body} ${fillHeight ? styles.bodyFill : ""} ${classNames?.body ?? ""}`,
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
          extra={titleLink}
        />
      }
      extra={
        <TransitionLayout in={!loading} className={styles.headerActionsFade}>
          <InfoDrawerExtra
            extra={extra}
            to={linkPlacement === "title" ? undefined : linkTo}
            title={linkTitle}
            linkComponent={linkComponent}
          />
        </TransitionLayout>
      }
      mask={mask}
      width={width}
      destroyOnHidden={destroyOnHidden}
      onClose={onClose}
      {...restProps}
    >
      <InfoDrawerLoader loading={loading} />

      <div ref={layoutAnchorRef} className={`${styles.layoutAnchor} ${fillClass}`}>
        <SwitchTransitionLayout
          className={`${styles.layout} ${fillClass}`}
          activeKey={activeKey}
          onEnter={resetDrawerBodyScroll}
        >
          {() => (
            <div className={`${styles.content} ${fillClass}`}>
              {hasError ? (
                <InfoDrawerError message={errorMessage} />
              ) : loaders ? (
                <ErrorZone level="block" loaders={loaders}>
                  {hasData ? children : null}
                </ErrorZone>
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
