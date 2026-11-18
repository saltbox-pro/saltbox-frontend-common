import clsx from "clsx";
import {
  type ComponentType,
  type Key,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Drawer, type DrawerProps } from "saltbox-common/components/antd-wrappers/drawer";
import {
  SwitchTransitionLayout,
  TransitionLayout,
} from "saltbox-common/components/transition-layout";
import { NESTED_DRAWER_CLASS_NAME } from "saltbox-common/constants/dom-selectors";
import { ErrorZone, type LoadSource } from "saltbox-common/error-handling";

import { useDrawerResize } from "../hooks/use-drawer-resize";
import { getInfoDrawerDomId, INFO_DRAWER_PATH_ATTR } from "../utils/info-drawer-dom";

import { InfoDrawerError } from "./info-drawer-error";
import { InfoDrawerExtra } from "./info-drawer-extra";
import { InfoDrawerLink } from "./info-drawer-link";
import { InfoDrawerLoader } from "./info-drawer-loader";
import { InfoDrawerPathContext } from "./info-drawer-path-context";
import { InfoDrawerResizeSplitter } from "./info-drawer-resize-splitter";
import { InfoDrawerTitle } from "./info-drawer-title";
import styles from "./info-drawer.module.css";

const DEFAULT_MIN_WIDTH = 500;

export interface InfoDrawerProps extends PropsWithChildren, Omit<DrawerProps, "title"> {
  drawerId: string;
  titleName?: string;
  titleLabel?: string;
  titleExtra?: ReactNode;
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
  nested?: boolean;
  resizable?: boolean;
  minWidth?: number;
  onClose: () => void;
}

export function InfoDrawer({
  drawerId,
  transitionKey,
  open,
  titleName,
  titleLabel,
  titleExtra,
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
  nested = false,
  resizable = false,
  minWidth = DEFAULT_MIN_WIDTH,
  onClose,
  afterOpenChange,
  children,
  classNames,
  drawerRender,
  ...restProps
}: InfoDrawerProps) {
  const onCloseRef = useRef(onClose);
  const layoutAnchorRef = useRef<HTMLDivElement>(null);
  const [isResizeReady, setIsResizeReady] = useState(false);
  const { drawerWidth, splitterPlacement, handleResize, handleCommit } = useDrawerResize({
    drawerId,
    width,
    placement,
    enabled: resizable && !nested && typeof width === "number",
    minWidth,
  });
  const isSplitterActive = splitterPlacement !== null && isResizeReady;

  const parentDrawerPath = useContext(InfoDrawerPathContext);
  const drawerPath = useMemo(() => [...parentDrawerPath, drawerId], [parentDrawerPath, drawerId]);
  const drawerPathAttr = { [INFO_DRAWER_PATH_ATTR]: drawerPath.join(" ") };

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

  useEffect(() => {
    if (open) setIsResizeReady(false);
  }, [open]);

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

  const handleAfterOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsResizeReady(isOpen);
      afterOpenChange?.(isOpen);
    },
    [afterOpenChange]
  );

  const renderDrawerPanel = useCallback(
    (node: ReactNode) => {
      const panel = drawerRender ? drawerRender(node) : node;
      if (!isSplitterActive || typeof drawerWidth !== "number" || splitterPlacement === null) {
        return panel;
      }

      return (
        <InfoDrawerResizeSplitter
          placement={splitterPlacement}
          width={drawerWidth}
          minWidth={minWidth}
          onResize={handleResize}
          onCommit={handleCommit}
        >
          {panel}
        </InfoDrawerResizeSplitter>
      );
    },
    [
      drawerRender,
      drawerWidth,
      handleCommit,
      handleResize,
      isSplitterActive,
      minWidth,
      splitterPlacement,
    ]
  );

  return (
    <InfoDrawerPathContext.Provider value={drawerPath}>
      <Drawer
        id={getInfoDrawerDomId(drawerId)}
        {...drawerPathAttr}
        rootClassName={clsx(
          styles.drawer,
          fillHeight && styles.fillHeight,
          nested && NESTED_DRAWER_CLASS_NAME,
          isSplitterActive && styles.resizable,
          rootClassName
        )}
        classNames={{
          ...classNames,
          header: classNames?.header,
          body: clsx(styles.body, fillHeight && styles.bodyFill, classNames?.body),
        }}
        open={open}
        size={size}
        placement={placement}
        title={
          <InfoDrawerTitle
            activeTransitionKey={open ? "opened" : "closed"}
            name={titleName}
            label={titleLabel}
            titleExtra={titleExtra}
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
        width={drawerWidth}
        drawerRender={renderDrawerPanel}
        destroyOnHidden={destroyOnHidden}
        onClose={onClose}
        afterOpenChange={handleAfterOpenChange}
        {...restProps}
      >
        <InfoDrawerLoader loading={loading} />

        <div
          ref={layoutAnchorRef}
          className={clsx(styles.layoutAnchor, fillHeight && styles.fillChild)}
        >
          <SwitchTransitionLayout
            className={clsx(styles.layout, fillHeight && styles.fillChild)}
            activeKey={activeKey}
            onEnter={resetDrawerBodyScroll}
          >
            {() => (
              <div className={clsx(styles.content, fillHeight && styles.fillChild)}>
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
    </InfoDrawerPathContext.Provider>
  );
}
