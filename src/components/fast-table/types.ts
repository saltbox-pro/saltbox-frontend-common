import type { MouseEvent, ReactNode } from "react";

import type { ActionLinkLinkComponent } from "saltbox-common/components/buttons/action-link-button";
import type { BaseActionButtonProps } from "saltbox-common/components/buttons/base-action-button";

export type CellActionLinkComponent = ActionLinkLinkComponent;

export type CellActionButtonProps = Partial<
  Omit<BaseActionButtonProps, "icon" | "title" | "disabled" | "onClick">
>;

export type CellActionPresentation = {
  title?: string;
  buttonProps?: CellActionButtonProps;
};

export type CellAction<T = any> = {
  icon: ReactNode;
  title?: string;
  visible?: (value: any, row: T) => boolean;
  disabled?: (value: any, row: T) => boolean;
  onClick?: (value: any, row: T, event: MouseEvent) => void;
  getHref?: (value: any, row: T) => string;
  target?: "_blank" | "_self";
  buttonProps?: CellActionButtonProps;
  getPresentation?: (value: any, row: T) => CellActionPresentation | undefined;
};

export type CellMeta<T = any> = {
  columnTitle?: string;
  showCopy?: boolean;
  copyValue?: (row: T) => string;
  renderCopy?: (row: T) => ReactNode;
  actions?: CellAction<T>[];
  tdClassName?: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  color?: "accent";
  ellipsis?: boolean;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends CellMeta<TData> {}
}
