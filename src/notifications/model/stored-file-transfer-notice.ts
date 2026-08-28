import type { FileBrowserTransferItem } from "../../components/file-browser/model/upload-types";

export type StoredFileTransferNotice = {
  title: string;
  canClose: boolean;
  transfers: Array<[string, FileBrowserTransferItem]>;
  onCancelTransfer: (transferId: string) => void;
  onClose: () => void;
  formatError?: (errorCode: string, item: FileBrowserTransferItem) => string | undefined;
};
