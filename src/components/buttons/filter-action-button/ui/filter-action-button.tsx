import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { MatIcon } from "../../../mat-icon";
import { BaseActionButton, type BaseActionButtonProps } from "../../base-action-button";

export type FilterActionButtonProps = Omit<BaseActionButtonProps, "icon" | "title"> & {
  active?: boolean;
  title?: string;
};

function getIcon(active = false): ReactNode {
  return <MatIcon icon={active ? "filter_alt_off" : "filter_alt"} size="small" />;
}

function getPresentation(active: boolean, title: string) {
  return {
    icon: getIcon(active),
    title,
  };
}

function FilterActionButtonComponent({
  active = false,
  title,
  ...restProps
}: FilterActionButtonProps) {
  const { t } = useTranslation("common");
  const resolvedTitle =
    title ?? (active ? t("action-button.remove-filter") : t("action-button.add-filter"));

  return <BaseActionButton icon={getIcon(active)} title={resolvedTitle} {...restProps} />;
}

export const FilterActionButton = Object.assign(FilterActionButtonComponent, {
  getIcon,
  getPresentation,
});
