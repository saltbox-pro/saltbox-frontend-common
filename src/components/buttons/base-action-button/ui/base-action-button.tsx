import { Button, type ButtonProps } from "antd";
import type { ReactNode } from "react";

export interface BaseActionButtonProps extends Omit<ButtonProps, "title"> {
  icon: ReactNode;
  title: string | undefined;
}

export function BaseActionButton({
  icon,
  color = "default",
  variant = "outlined",
  size = "small",
  ...restProps
}: BaseActionButtonProps) {
  return <Button icon={icon} color={color} variant={variant} size={size} {...restProps} />;
}
