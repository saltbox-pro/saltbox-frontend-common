import { MoreOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

import { Dropdown, type DropdownProps } from "saltbox-common/components/antd-wrappers/dropdown";

export type ActionDropdownItem = NonNullable<NonNullable<DropdownProps["menu"]>["items"]>[number];

export type ActionDropdownProps = DropdownProps & {
  disabledTooltip?: string;
};

export function ActionDropdown({
  children,
  disabled,
  disabledTooltip,
  ...restProps
}: ActionDropdownProps) {
  const { t } = useTranslation("common");

  const dropdown = (
    <Dropdown trigger={["click"]} disabled={disabled} {...restProps}>
      <Button icon={<MoreOutlined />} iconPosition="end" disabled={disabled}>
        {children ?? t("action-dropdown-button.actions")}
      </Button>
    </Dropdown>
  );

  if (!disabled || !disabledTooltip) {
    return dropdown;
  }

  return (
    <Tooltip title={disabledTooltip}>
      <span>{dropdown}</span>
    </Tooltip>
  );
}
