import type { FileBrowserUploadItem } from "../components/file-browser/model/upload-types";
import {
  UiEvent,
  type UploadNoticeEventDetail,
  type UploadNoticePatchDetail,
  type UploadNoticeUpsertDetail,
} from "../interfaces/ui-events";
import { publish, subscribe } from "../utils/custom-events";

declare global {
  interface Window {
    __saltboxUploadNoticeHostReady?: boolean;
  }
}

let buffer: UploadNoticeEventDetail[] = [];
let subscribed = false;

const isHostReady = (): boolean =>
  typeof window !== "undefined" && Boolean(window.__saltboxUploadNoticeHostReady);

function ensureSubscribed(): void {
  if (subscribed || typeof document === "undefined") {
    return;
  }
  subscribed = true;
  subscribe(UiEvent.UploadNoticeHostReady, () => {
    const pending = buffer;
    buffer = [];
    pending.forEach((detail) => publish(UiEvent.UploadNotice, detail));
  });
}

function send(detail: UploadNoticeEventDetail): void {
  if (isHostReady()) {
    publish(UiEvent.UploadNotice, detail);
    return;
  }
  ensureSubscribed();
  buffer.push(detail);
}

export function setUploadNoticeHostReady(ready: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.__saltboxUploadNoticeHostReady = ready;
  if (ready) {
    publish(UiEvent.UploadNoticeHostReady, undefined);
  }
}

export function toUploadNoticeEntries(
  uploads: ReadonlyMap<string, FileBrowserUploadItem>
): Array<[string, FileBrowserUploadItem]> {
  return Array.from(uploads.entries()).map(([id, upload]) => [
    id,
    {
      fileName: upload.fileName,
      loaded: upload.loaded,
      total: upload.total,
      status: upload.status,
      error: upload.error,
      targetDirectory: upload.targetDirectory,
    },
  ]);
}

export const uploadNotice = {
  upsert: (detail: Omit<UploadNoticeUpsertDetail, "action">) =>
    send({ action: "upsert", ...detail }),
  patch: (detail: Omit<UploadNoticePatchDetail, "action">) => send({ action: "patch", ...detail }),
  remove: (key: string) => send({ action: "remove", key }),
};

export function resetUploadNoticeForTests(): void {
  buffer = [];
  subscribed = false;
}
