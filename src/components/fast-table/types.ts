import { ReactNode } from "react";

export type CellAction<T = any> = {
  /** Иконка действия */
  icon: ReactNode;
  /** Обработчик клика */
  onClick: (value: any, row: T, event: React.MouseEvent) => void;
  /** Tooltip при наведении */
  title?: string;
  /** Условие видимости (опционально) */
  visible?: (value: any, row: T) => boolean;
  /** Условие активности (опционально) */
  disabled?: (value: any, row: T) => boolean;
};

export type CellMeta<T = any> = {
  /** Показывать кнопку копирования */
  showCopy?: boolean;
  /** Значение для копирования (если отличается от отображаемого) */
  copyValue?: (row: T) => string;
  /** Массив дополнительных действий */
  actions?: CellAction<T>[];
  /** CSS класс для td */
  tdClassName?: string;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends CellMeta<TData> {}
}
