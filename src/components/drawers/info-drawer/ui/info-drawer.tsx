import {
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import { Drawer, type DrawerProps } from "saltbox-common/components/antd-wrappers/drawer";

import { InfoDrawerError } from "./info-drawer-error";
import { InfoDrawerLink } from "./info-drawer-link";
import { InfoDrawerLoader } from "./info-drawer-loader";
import { InfoDrawerTitle } from "./info-drawer-title";

export interface InfoDrawerProps
  extends PropsWithChildren, Pick<DrawerProps, "open" | "size" | "placement" | "extra"> {
  onClose: () => void;
  titleName?: string;
  titleLabel?: string;
  linkTo?: string;
  linkTitle?: string;
  linkComponent?: ComponentType<{ to: string; children: ReactNode }>;
  errorMessage?: string | null;
  isLoading?: boolean;
  hasData?: boolean;
  onAfterClose?: () => void;
}

export function InfoDrawer({
  open,
  titleName,
  titleLabel,
  linkTo,
  linkTitle,
  linkComponent,
  errorMessage,
  isLoading,
  hasData = true,
  size = "large",
  placement = "right",
  extra,
  onClose,
  onAfterClose,
  children,
}: InfoDrawerProps) {
  const handleAfterOpenChange = (isOpen: boolean) => {
    if (!isOpen && onAfterClose) {
      onAfterClose();
    }
  };

  const onCloseRef = useRef(onClose);
  const onAfterCloseRef = useRef(onAfterClose);

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

  const hasError = !isLoading && !!errorMessage;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={size}
      placement={placement}
      title={<InfoDrawerTitle name={titleName} label={titleLabel} />}
      extra={
        <>
          {extra} <InfoDrawerLink to={linkTo} title={linkTitle} linkComponent={linkComponent} />
        </>
      }
      afterOpenChange={handleAfterOpenChange}
      mask={false}
    >
      {isLoading && <InfoDrawerLoader />}

      {hasData && !hasError && !isLoading
        ? children
        : hasError && <InfoDrawerError message={errorMessage} />}
    </Drawer>
  );
}
