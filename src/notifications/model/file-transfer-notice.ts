import {
  UiEvent,
  type FileTransferNoticeEventDetail,
  type FileTransferNoticePatchDetail,
  type FileTransferNoticeUpsertDetail,
} from "../../interfaces/ui-events";
import { publish, subscribe } from "../../utils/custom-events";

declare global {
  interface Window {
    __saltboxFileTransferNoticeHostReady?: boolean;
  }
}

let buffer: FileTransferNoticeEventDetail[] = [];
let subscribed = false;

const isHostReady = (): boolean =>
  typeof window !== "undefined" && Boolean(window.__saltboxFileTransferNoticeHostReady);

function ensureSubscribed(): void {
  if (subscribed || typeof document === "undefined") {
    return;
  }
  subscribed = true;
  subscribe(UiEvent.FileTransferNoticeHostReady, () => {
    const pending = buffer;
    buffer = [];
    pending.forEach((detail) => publish(UiEvent.FileTransferNotice, detail));
  });
}

function send(detail: FileTransferNoticeEventDetail): void {
  if (isHostReady()) {
    publish(UiEvent.FileTransferNotice, detail);
    return;
  }
  ensureSubscribed();
  buffer.push(detail);
}

export function setFileTransferNoticeHostReady(ready: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.__saltboxFileTransferNoticeHostReady = ready;
  if (ready) {
    publish(UiEvent.FileTransferNoticeHostReady, undefined);
  }
}

export const fileTransferNotice = {
  upsert: (detail: Omit<FileTransferNoticeUpsertDetail, "action">) =>
    send({ action: "upsert", ...detail }),
  patch: (detail: Omit<FileTransferNoticePatchDetail, "action">) =>
    send({ action: "patch", ...detail }),
  remove: (key: string) => send({ action: "remove", key }),
};

export function resetFileTransferNoticeForTests(): void {
  buffer = [];
  subscribed = false;
}
