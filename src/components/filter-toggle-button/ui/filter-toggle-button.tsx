import { FilterOutlined } from "@ant-design/icons";
import { type ButtonProps, Button, Flex } from "antd";
import { useTranslation } from "react-i18next";

import { FiltersCounter } from "../../filters-counter/filters-counter";

interface FilterToggleButtonProps {
  isOpen: boolean;
  activeFiltersCount: number;
  onToggle: () => void;
  buttonProps?: ButtonProps;
}

export function FilterToggleButton({
  isOpen,
  activeFiltersCount,
  onToggle,
  buttonProps,
}: FilterToggleButtonProps) {
  const { t } = useTranslation("common");

  const hasFilters = activeFiltersCount > 0;

  return (
    <Button
      onClick={onToggle}
      color="primary"
      variant={hasFilters || isOpen ? "solid" : "outlined"}
      {...buttonProps}
    >
      <Flex gap={8} align="center">
        <FilterOutlined />
        {t("filters.button-show-filters")}
        <FiltersCounter count={activeFiltersCount} />
      </Flex>
    </Button>
  );
}
