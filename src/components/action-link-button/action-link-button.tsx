import { ExportOutlined } from "@ant-design/icons";
import type { ComponentType, MouseEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseActionButton,
  type BaseActionButtonProps,
} from "../base-action-button/base-action-button";

export type ActionLinkLinkComponent = ComponentType<{
  to: string;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
}>;

export type ActionLinkButtonProps = Omit<
  BaseActionButtonProps,
  "icon" | "title" | "href" | "target"
> & {
  href: string;
  icon?: ReactNode;
  title?: string;
  target?: "_blank" | "_self";
  linkComponent?: ActionLinkLinkComponent;
};

export function ActionLinkButton({
  href,
  icon,
  title,
  target = "_blank",
  linkComponent: LinkComponent,
  onClick,
  ...restProps
}: ActionLinkButtonProps) {
  const { t } = useTranslation("common");
  const resolvedIcon = icon ?? <ExportOutlined />;
  const resolvedTitle = title ?? t("action-button.open-link");

  if (LinkComponent) {
    return (
      <LinkComponent to={href} onClick={onClick}>
        <BaseActionButton icon={resolvedIcon} title={resolvedTitle} {...restProps} />
      </LinkComponent>
    );
  }

  return (
    <BaseActionButton
      icon={resolvedIcon}
      title={resolvedTitle}
      href={href}
      target={target}
      onClick={onClick}
      {...restProps}
    />
  );
}
