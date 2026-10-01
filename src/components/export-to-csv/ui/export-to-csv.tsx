import { useExportToCsvConfirm } from "../hooks/use-export-to-csv-confirm";

import { ExportToCsvButton } from "./export-to-csv-button";

export type ExportToCsvProps = {
  scope: string;
  onExport: () => Promise<boolean>;
};

export function ExportToCsv({ scope, onExport }: ExportToCsvProps) {
  const { isExporting, openConfirm, modalContextHolder } = useExportToCsvConfirm({
    scope,
    onExport,
  });

  return (
    <>
      {modalContextHolder}
      <ExportToCsvButton loading={isExporting} onClick={openConfirm} />
    </>
  );
}
