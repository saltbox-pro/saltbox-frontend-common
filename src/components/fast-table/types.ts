import type { ReactNode, MouseEvent } from "react";

import type { BaseActionButtonProps } from "saltbox-common/components/base-action-button/base-action-button";

export type CellAction<T = any> = {
  icon: ReactNode;
  title?: string;
  visible?: (value: any, row: T) => boolean;
  disabled?: (value: any, row: T) => boolean;
  onClick: (value: any, row: T, event: MouseEvent) => void;
  buttonProps?: Partial<Omit<BaseActionButtonProps, "icon" | "title" | "disabled" | "onClick">>;
};

export type CellMeta<T = any> = {
  showCopy?: boolean;
  copyValue?: (row: T) => string;
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
