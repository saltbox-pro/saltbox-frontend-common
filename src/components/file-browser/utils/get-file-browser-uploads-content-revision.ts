import type { FileBrowserTransferItem } from "../model/upload-types";

export function getFileBrowserUploadsContentRevision(
  uploads: ReadonlyMap<string, FileBrowserTransferItem>
): string {
  return Array.from(uploads.entries())
    .map(
      ([id, upload]) =>
        `${id}:${upload.status}:${upload.loaded}:${upload.total}:${upload.error ?? ""}:${upload.appError?.status ?? ""}:${upload.appError?.kind ?? ""}:${upload.appError?.serverMessage ?? ""}:${upload.targetDirectory ?? ""}`
    )
    .join("|");
}

export function getFileTransferNoticeRenderRevision(notice: {
  title: string;
  canClose: boolean;
  transfers: Iterable<readonly [string, FileBrowserTransferItem]>;
}): string {
  return `${notice.title}\0${notice.canClose ? "1" : "0"}\0${getFileBrowserUploadsContentRevision(
    new Map(notice.transfers)
  )}`;
}
