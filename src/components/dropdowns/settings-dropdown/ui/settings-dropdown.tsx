import { SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

import { Dropdown, type DropdownProps } from "saltbox-common/components/antd-wrappers/dropdown";

import styles from "./settings-dropdown.module.css";

export type SettingsDropdownProps = Omit<DropdownProps, "children"> & {
  loading?: boolean;
  compact?: boolean;
};

export function SettingsDropdown({
  disabled,
  loading,
  compact = false,
  ...restProps
}: SettingsDropdownProps) {
  const { t } = useTranslation("common");

  return (
    <Dropdown trigger={["click"]} disabled={disabled} {...restProps}>
      <Button
        className={compact ? undefined : styles.wide}
        icon={<SettingOutlined />}
        disabled={disabled}
        loading={loading}
        aria-label={t("settings-dropdown-button.label")}
      />
    </Dropdown>
  );
}
