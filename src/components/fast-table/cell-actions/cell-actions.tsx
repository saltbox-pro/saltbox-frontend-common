import { BaseActionButton } from "../../base-action-button/base-action-button";
import { CopyToClipboardButton } from "../../copy-to-clipboard-button/copy-to-clipboard-button";
import type { CellAction } from "../types";

import styles from "./cell-actions.module.css";

export type CellActionsProps<T> = {
  value: unknown;
  row: T;
  showCopy?: boolean;
  copyValue?: string;
  actions?: CellAction<T>[];
};

export function CellActions<T>({
  value,
  row,
  showCopy,
  copyValue,
  actions = [],
}: CellActionsProps<T>) {
  const visibleActions = actions.filter((action) => {
    if (!action.visible) return true;
    return action.visible(value, row);
  });

  if (!showCopy && visibleActions.length === 0) {
    return null;
  }

  return (
    <span className={`${styles.actions} cell-actions`}>
      {showCopy && <CopyToClipboardButton text={copyValue ?? String(value ?? "")} />}
      {visibleActions.map((action, index) => {
        const isDisabled = action.disabled?.(value, row) ?? false;
        return (
          <BaseActionButton
            key={index}
            icon={action.icon}
            title={action.title ?? ""}
            disabled={isDisabled}
            onClick={(e) => {
              e?.stopPropagation?.();
              if (!isDisabled) {
                action.onClick(value, row, e);
              }
            }}
          />
        );
      })}
    </span>
  );
}
