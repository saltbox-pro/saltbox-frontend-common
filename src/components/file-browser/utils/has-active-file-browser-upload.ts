import type { FileBrowserUploadItem } from "../model/upload-types";

export function hasActiveFileBrowserUpload(
  uploads: ReadonlyMap<string, FileBrowserUploadItem>
): boolean {
  return Array.from(uploads.values()).some(
    (upload) => upload.status === "uploading" || upload.status === "queued"
  );
}
