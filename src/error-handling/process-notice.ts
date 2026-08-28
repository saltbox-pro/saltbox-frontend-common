import {
  UiEvent,
  type ProcessNoticeEventDetail,
  type ProcessNoticeUpsertDetail,
} from "../interfaces/ui-events";
import { publish, subscribe } from "../utils/custom-events";

declare global {
  interface Window {
    __saltboxProcessNoticeHostReady?: boolean;
  }
}

let buffer: ProcessNoticeEventDetail[] = [];
let subscribed = false;

const onHostReady = () => {
  const pending = buffer;
  buffer = [];
  pending.forEach((detail) => publish(UiEvent.ProcessNotice, detail));
};

const isHostReady = (): boolean =>
  typeof window !== "undefined" && Boolean(window.__saltboxProcessNoticeHostReady);

function ensureSubscribed(): void {
  if (subscribed || typeof document === "undefined") {
    return;
  }
  subscribed = true;
  subscribe(UiEvent.ProcessNoticeHostReady, onHostReady);
}

function send(detail: ProcessNoticeEventDetail): void {
  if (isHostReady()) {
    publish(UiEvent.ProcessNotice, detail);
    return;
  }
  ensureSubscribed();
  buffer.push(detail);
}

export function setProcessNoticeHostReady(ready: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.__saltboxProcessNoticeHostReady = ready;
  if (ready) {
    publish(UiEvent.ProcessNoticeHostReady, undefined);
  }
}

export const processNotice = {
  upsert: (detail: Omit<ProcessNoticeUpsertDetail, "action">) =>
    send({ action: "upsert", ...detail }),
  remove: (key: string) => send({ action: "remove", key }),
};
