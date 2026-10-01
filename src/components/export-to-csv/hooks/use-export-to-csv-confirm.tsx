import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useExportToCsv } from "./use-export-to-csv";
import { ExportToCsvConfirmContent } from "../ui/export-to-csv-confirm-content";

export type UseExportToCsvConfirmOptions = {
  scope: string;
  onExport: () => Promise<boolean>;
};

export function useExportToCsvConfirm({ scope, onExport }: UseExportToCsvConfirmOptions) {
  const { t } = useTranslation("common");

  const content = useMemo(() => <ExportToCsvConfirmContent scope={scope} />, [scope]);

  return useExportToCsv({
    onExport,
    title: t("export-to-csv.title"),
    content,
    okText: t("export-to-csv.export"),
    cancelText: t("export-to-csv.cancel"),
  });
}
