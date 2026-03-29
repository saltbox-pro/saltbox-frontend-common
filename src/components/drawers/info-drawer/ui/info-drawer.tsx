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
  linkTo?: string;
  linkTitle?: string;
  linkComponent?: ComponentType<{ to: string; children: ReactNode }>;
  errorMessage?: string | null;
  hasData?: boolean;
  transitionKey?: Key;
  onClose: () => void;
  onAfterClose?: () => void;
}

export function InfoDrawer({
  drawerId,
  transitionKey,
  titleName,
  titleLabel,
  linkTo,
  linkTitle,
  linkComponent,
  errorMessage,
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
  onAfterClose,
  children,
  classNames,
  ...restProps
}: InfoDrawerProps) {
  const onCloseRef = useRef(onClose);
  const onAfterCloseRef = useRef(onAfterClose);

  const hasError = !loading && !!errorMessage;
  const activeKey = useMemo(
    () => transitionKey ?? (hasError ? "error" : hasData ? "content" : "empty"),
    [hasData, hasError, transitionKey]
  );

  const handleAfterOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && onAfterClose) {
        onAfterClose();
      }
    },
    [onAfterClose]
  );

  useEffect(() => {
    onCloseRef.current = onClose;
    onAfterCloseRef.current = onAfterClose;
  });

  useEffect(() => {
    return () => {
      onCloseRef.current();
      onAfterCloseRef.current?.();
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
      size={size}
      placement={placement}
      title={<InfoDrawerTitle name={titleName} label={titleLabel} />}
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
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden={destroyOnHidden}
      onClose={onClose}
      {...restProps}
    >
      <InfoDrawerLoader loading={loading} />

      <SwitchTransitionLayout className={styles.layout} activeKey={activeKey}>
        {() => (
          <div className={styles.content}>
            {hasError ? <InfoDrawerError message={errorMessage} /> : hasData ? children : null}
          </div>
        )}
      </SwitchTransitionLayout>
    </Drawer>
  );
}
