import type { AppError } from "../../../error-handling/app-error";

export type FileBrowserTransferActiveStatus = "queued" | "uploading" | "downloading" | "cancelling";

export type FileBrowserTransferStatus = FileBrowserTransferActiveStatus | "done" | "error";

export interface FileBrowserTransferItem {
  fileName: string;
  loaded: number;
  total: number;
  status: FileBrowserTransferStatus;
  error?: string;
  appError?: AppError | null;
  targetDirectory?: string;
}

export type FileBrowserUploadStatus = "queued" | "uploading" | "cancelling" | "done" | "error";

export interface FileBrowserUploadItem extends FileBrowserTransferItem {
  status: FileBrowserUploadStatus;
}

export type FileBrowserDownloadStatus = "queued" | "downloading" | "cancelling" | "done" | "error";

export interface FileBrowserDownloadItem extends FileBrowserTransferItem {
  status: FileBrowserDownloadStatus;
}

export function isFileBrowserTransferInProgress(status: FileBrowserTransferStatus): boolean {
  return (
    status === "queued" ||
    status === "uploading" ||
    status === "downloading" ||
    status === "cancelling"
  );
}

export function isFileBrowserTransferCancellable(status: FileBrowserTransferStatus): boolean {
  return status === "queued" || status === "uploading" || status === "downloading";
}

export type FileBrowserUploadFileHandler = (file: File) => void | Promise<void>;
