import type { ReactNode } from "react";
import { getI18n, useTranslation } from "react-i18next";

import { MatIcon } from "../../../mat-icon";
import { BaseActionButton, type BaseActionButtonProps } from "../../base-action-button";

export type FilterActionButtonProps = Omit<BaseActionButtonProps, "icon" | "title"> & {
  active?: boolean;
  title?: string;
};

function getIcon(active = false): ReactNode {
  return <MatIcon icon={active ? "filter_alt_off" : "filter_alt"} size="small" />;
}

function getTitleKey(active: boolean): "action-button.remove-filter" | "action-button.add-filter" {
  return active ? "action-button.remove-filter" : "action-button.add-filter";
}

function getDefaultTitle(active: boolean): string {
  return getI18n().t(getTitleKey(active), { ns: "common" });
}

function getPresentation(active: boolean, title?: string) {
  return {
    icon: getIcon(active),
    title: title ?? getDefaultTitle(active),
  };
}

function FilterActionButtonComponent({
  active = false,
  title,
  ...restProps
}: FilterActionButtonProps) {
  const { t } = useTranslation("common");
  const resolvedTitle = title ?? t(getTitleKey(active));

  return <BaseActionButton icon={getIcon(active)} title={resolvedTitle} {...restProps} />;
}

export const FilterActionButton = Object.assign(FilterActionButtonComponent, {
  getIcon,
  getPresentation,
});
