import { ActionLinkButton } from "../../action-link-button";

export type NavigationIconLinkProps = {
  to: string;
  icon?: React.ReactNode;
  target?: "_blank" | "_self" | "self";
  title?: string;
};

export const NavigationIconLink = (props: NavigationIconLinkProps) => {
  const { to, icon, target = "_blank", title, ...rest } = props;
  const resolvedTarget = target === "self" ? "_self" : target;
  return <ActionLinkButton href={to} icon={icon} title={title} target={resolvedTarget} {...rest} />;
};
