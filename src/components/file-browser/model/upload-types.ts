export type FileBrowserUploadStatus = "uploading" | "done" | "error";

export interface FileBrowserUploadItem {
  fileName: string;
  loaded: number;
  total: number;
  status: FileBrowserUploadStatus;
  error?: string;
}

export type FileBrowserUploadFileHandler = (file: File) => void | Promise<void>;
