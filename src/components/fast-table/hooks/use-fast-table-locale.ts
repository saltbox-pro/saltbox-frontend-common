import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type FastTableLocaleOverrides = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
  total?: string;
  empty?: string;
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
    }),
    [
      overrides?.sortAscending,
      overrides?.sortDescending,
      overrides?.clearSort,
      overrides?.total,
      overrides?.empty,
      t,
    ]
  );
}
