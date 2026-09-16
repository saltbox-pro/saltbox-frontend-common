import type { ReactNode } from "react";

import { ActionLinkButton } from "../../buttons/action-link-button";
import { BaseActionButton } from "../../buttons/base-action-button";
import { CopyToClipboardButton } from "../../buttons/copy-to-clipboard-button";
import type { CellAction, CellActionLinkComponent } from "../types";

import styles from "./cell-actions.module.css";

export type CellActionsProps<T> = {
  value: unknown;
  row: T;
  showCopy?: boolean;
  copyValue?: string;
  renderCopy?: ReactNode;
  actions?: CellAction<T>[];
  linkComponent?: CellActionLinkComponent;
};

export function CellActions<T>({
  value,
  row,
  showCopy,
  copyValue,
  renderCopy,
  actions = [],
  linkComponent: LinkComponent,
}: CellActionsProps<T>) {
  const visibleActions = actions.filter((action) => {
    if (!action.visible) return true;
    return action.visible(value, row);
  });

  const resolvedCopyValue = copyValue ?? String(value ?? "");
  const hasCopy = Boolean(renderCopy || (showCopy && resolvedCopyValue));

  if (!hasCopy && visibleActions.length === 0) {
    return null;
  }

  return (
    <span className={`${styles.actions} cell-actions`}>
      {hasCopy && (renderCopy ?? <CopyToClipboardButton text={resolvedCopyValue} />)}
      {visibleActions.map((action, index) => {
        const isDisabled = action.disabled?.(value, row) ?? false;
        const href = action.getHref?.(value, row);
        const presentation = action.getPresentation?.(value, row);
        const title = presentation?.title ?? action.title;
        const buttonProps = presentation?.buttonProps ?? action.buttonProps;

        if (href) {
          return (
            <ActionLinkButton
              key={index}
              href={href}
              icon={action.icon}
              title={title}
              {...buttonProps}
              target={action.target ?? "_self"}
              disabled={isDisabled}
              onClick={(event) => {
                event.stopPropagation();
              }}
              linkComponent={LinkComponent}
            />
          );
        }

        return (
          <BaseActionButton
            key={index}
            icon={action.icon}
            title={title}
            {...buttonProps}
            disabled={isDisabled}
            onClick={(e) => {
              e?.stopPropagation?.();
              if (!isDisabled && action.onClick) {
                action.onClick(value, row, e);
              }
            }}
          />
        );
      })}
    </span>
  );
}
