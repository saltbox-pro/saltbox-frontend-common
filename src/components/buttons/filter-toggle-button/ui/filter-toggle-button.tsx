import { FilterOutlined } from "@ant-design/icons";
import { type ButtonProps, Button, Flex } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { FiltersCounter } from "../../../filters-counter/filters-counter";

interface FilterToggleButtonProps {
  isOpen: boolean;
  activeFiltersCount: number;
  onToggle: () => void;
  buttonProps?: ButtonProps;
  label?: ReactNode;
}

export function FilterToggleButton({
  isOpen,
  activeFiltersCount,
  onToggle,
  buttonProps,
  label,
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
        {label ?? t("filters.button-show-filters")}
        <FiltersCounter count={activeFiltersCount} />
      </Flex>
    </Button>
  );
}
