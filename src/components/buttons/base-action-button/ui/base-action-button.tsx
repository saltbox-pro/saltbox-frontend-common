import { Button, type ButtonProps } from "antd";
import type { ReactNode } from "react";

export interface BaseActionButtonProps extends Omit<ButtonProps, "title"> {
  icon: ReactNode;
  title?: string;
}

export function BaseActionButton({
  icon,
  title,
  color = "default",
  variant = "outlined",
  size = "small",
  ...restProps
}: BaseActionButtonProps) {
  return (
    <Button icon={icon} title={title} color={color} variant={variant} size={size} {...restProps} />
  );
}
