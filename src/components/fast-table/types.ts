import type { ReactNode, MouseEvent } from "react";

export type CellAction<T = any> = {
  icon: ReactNode;
  onClick: (value: any, row: T, event: MouseEvent) => void;
  title?: string;
  visible?: (value: any, row: T) => boolean;
  disabled?: (value: any, row: T) => boolean;
};

export type CellMeta<T = any> = {
  showCopy?: boolean;
  copyValue?: (row: T) => string;
  actions?: CellAction<T>[];
  tdClassName?: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends CellMeta<TData> {}
}
