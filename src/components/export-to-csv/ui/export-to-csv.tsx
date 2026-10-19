import type { ReactNode } from "react";

import { useExportToCsvConfirm } from "../hooks/use-export-to-csv-confirm";

import { ExportToCsvButton } from "./export-to-csv-button";

type ExportToCsvBaseProps = {
  onExport: () => Promise<boolean>;
};

export type ExportToCsvProps = ExportToCsvBaseProps &
  (
    | {
        scope: string;
        confirmContent?: undefined;
      }
    | {
        confirmContent: ReactNode;
        scope?: undefined;
      }
  );

export function ExportToCsv({ scope, onExport, confirmContent }: ExportToCsvProps) {
  const { isExporting, openConfirm, modalContextHolder } = useExportToCsvConfirm({
    scope,
    onExport,
    confirmContent,
  });

  return (
    <>
      {modalContextHolder}
      <ExportToCsvButton loading={isExporting} onClick={openConfirm} />
    </>
  );
}
