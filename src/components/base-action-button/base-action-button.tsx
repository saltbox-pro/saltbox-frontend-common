import { Button, Tooltip, type ButtonProps } from "antd";
import { ReactNode } from "react";

export interface BaseActionButtonProps extends Omit<ButtonProps, "title"> {
  icon: ReactNode;
  title: string;
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
    <Tooltip title={title}>
      <Button icon={icon} color={color} variant={variant} size={size} {...restProps} />
    </Tooltip>
  );
}
