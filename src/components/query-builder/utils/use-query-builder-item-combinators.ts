import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { buildQueryBuilderItemCombinators } from "../../../utils/query-builder-utils";

export function useQueryBuilderItemCombinators(enabled: boolean) {
  const { t, i18n } = useTranslation("common");

  return useMemo(
    () => (enabled ? buildQueryBuilderItemCombinators(t) : undefined),
    [enabled, i18n.language, t]
  );
}
