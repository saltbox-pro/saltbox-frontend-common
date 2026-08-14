import {
  isFileBrowserTransferInProgress,
  type FileBrowserTransferItem,
} from "../model/upload-types";

export function hasActiveFileBrowserTransfer<TItem extends FileBrowserTransferItem>(
  transfers: ReadonlyMap<string, TItem>
): boolean {
  return Array.from(transfers.values()).some((item) =>
    isFileBrowserTransferInProgress(item.status)
  );
}
