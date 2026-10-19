import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ExportToCsvConfirmContent } from "../ui/export-to-csv-confirm-content";

import { useExportToCsv } from "./use-export-to-csv";

export type UseExportToCsvConfirmOptions = {
  onExport: () => Promise<boolean>;
  scope?: string;
  confirmContent?: ReactNode;
};

export function useExportToCsvConfirm({
  scope = "",
  onExport,
  confirmContent,
}: UseExportToCsvConfirmOptions) {
  const { t } = useTranslation("common");

  const content = useMemo(
    () => confirmContent ?? <ExportToCsvConfirmContent scope={scope} />,
    [confirmContent, scope]
  );

  return useExportToCsv({
    onExport,
    title: t("export-to-csv.title"),
    content,
    okText: t("export-to-csv.export"),
    cancelText: t("export-to-csv.cancel"),
  });
}
