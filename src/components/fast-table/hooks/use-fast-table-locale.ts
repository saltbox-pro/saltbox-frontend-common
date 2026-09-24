import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type FastTableLocaleOverrides = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
  total?: string;
  empty?: string;
  resetColumnWidths?: string;
  columnSettings?: string;
  columnSettingsApply?: string;
  refresh?: string;
  columnMenu?: string;
  moveColumnToStart?: string;
  moveColumnLeft?: string;
  moveColumnRight?: string;
  moveColumnToEnd?: string;
};

export function useFastTableLocale(overrides?: FastTableLocaleOverrides) {
  const { t } = useTranslation("common");

  return useMemo(
    () => ({
      sortAscending: overrides?.sortAscending ?? t("fast-table.sort-ascending"),
      sortDescending: overrides?.sortDescending ?? t("fast-table.sort-descending"),
      clearSort: overrides?.clearSort ?? t("fast-table.clear-sort"),
      total: overrides?.total ?? t("fast-table.total"),
      empty: overrides?.empty ?? t("fast-table.empty"),
      resetColumnWidths: overrides?.resetColumnWidths ?? t("fast-table.reset-column-widths"),
      columnSettings: overrides?.columnSettings ?? t("fast-table.column-settings"),
      columnSettingsApply: overrides?.columnSettingsApply ?? t("fast-table.column-settings-apply"),
      refresh: overrides?.refresh ?? t("refresh-button.refresh"),
      columnMenu: overrides?.columnMenu ?? t("fast-table.column-menu"),
      moveColumnToStart: overrides?.moveColumnToStart ?? t("fast-table.move-column-to-start"),
      moveColumnLeft: overrides?.moveColumnLeft ?? t("fast-table.move-column-left"),
      moveColumnRight: overrides?.moveColumnRight ?? t("fast-table.move-column-right"),
      moveColumnToEnd: overrides?.moveColumnToEnd ?? t("fast-table.move-column-to-end"),
    }),
    [
      overrides?.sortAscending,
      overrides?.sortDescending,
      overrides?.clearSort,
      overrides?.total,
      overrides?.empty,
      overrides?.resetColumnWidths,
      overrides?.columnSettings,
      overrides?.columnSettingsApply,
      overrides?.refresh,
      overrides?.columnMenu,
      overrides?.moveColumnToStart,
      overrides?.moveColumnLeft,
      overrides?.moveColumnRight,
      overrides?.moveColumnToEnd,
      t,
    ]
  );
}
