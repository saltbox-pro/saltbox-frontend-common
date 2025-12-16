import { ExportOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ReactNode } from "react";

export type NavigationIconLinkProps = {
  to: string;
  icon?: ReactNode;
  target?: "_blank" | "self";
};

export const NavigationIconLink = (props: NavigationIconLinkProps) => {
  const { to, icon, target = "_blank" } = props;
  return (
    <Button
      type="link"
      size={"small"}
      href={to}
      icon={icon ? icon : <ExportOutlined />}
      target={target}
    />
  );
};
