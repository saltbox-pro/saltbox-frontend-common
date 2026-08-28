import type { FileBrowserTransferItem } from "../../components/file-browser/model/upload-types";

export function toFileTransferNoticeEntries(
  transfers: ReadonlyMap<string, FileBrowserTransferItem>
): Array<[string, FileBrowserTransferItem]> {
  return Array.from(transfers.entries()).map(([id, transfer]) => [
    id,
    {
      fileName: transfer.fileName,
      loaded: transfer.loaded,
      total: transfer.total,
      status: transfer.status,
      error: transfer.error,
      targetDirectory: transfer.targetDirectory,
    },
  ]);
}
