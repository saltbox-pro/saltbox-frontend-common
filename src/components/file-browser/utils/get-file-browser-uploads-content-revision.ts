import type { FileBrowserUploadItem } from "../model/upload-types";

export function getFileBrowserUploadsContentRevision(
  uploads: ReadonlyMap<string, FileBrowserUploadItem>
): string {
  return Array.from(uploads.entries())
    .map(
      ([id, upload]) =>
        `${id}:${upload.status}:${upload.loaded}:${upload.total}:${upload.error ?? ""}:${upload.targetDirectory ?? ""}`
    )
    .join("|");
}
