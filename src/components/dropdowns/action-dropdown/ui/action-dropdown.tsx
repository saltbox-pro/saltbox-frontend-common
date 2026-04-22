import { MoreOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

import { Dropdown, type DropdownProps } from "saltbox-common/components/antd-wrappers/dropdown";

export type ActionDropdownItem = NonNullable<NonNullable<DropdownProps["menu"]>["items"]>[number];

type ActionDropdownProps = DropdownProps;

export function ActionDropdown({ children, ...restProps }: ActionDropdownProps) {
  const { t } = useTranslation("common");

  return (
    <Dropdown trigger={["click"]} {...restProps}>
      <Button icon={<MoreOutlined />} iconPosition="end">
        {children ?? t("action-dropdown-button.actions")}
      </Button>
    </Dropdown>
  );
}
