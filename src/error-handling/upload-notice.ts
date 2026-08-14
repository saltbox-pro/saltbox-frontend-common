import type { FileBrowserTransferItem } from "../components/file-browser/model/upload-types";
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

export function toTransferNoticeEntries(
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

export const transferNotice = {
  upsert: (detail: Omit<UploadNoticeUpsertDetail, "action">) =>
    send({ action: "upsert", ...detail }),
  patch: (detail: Omit<UploadNoticePatchDetail, "action">) => send({ action: "patch", ...detail }),
  remove: (key: string) => send({ action: "remove", key }),
};

export function resetUploadNoticeForTests(): void {
  buffer = [];
  subscribed = false;
}
