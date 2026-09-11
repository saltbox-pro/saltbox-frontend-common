import { useSyncExternalStore } from "react";

const FONT_SPEC = '24px "Material Symbols Outlined"';

let isReady = false;
let loadStarted = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function markReady(): void {
  if (isReady) {
    return;
  }
  isReady = true;
  notify();
}

function ensureLoad(): void {
  if (loadStarted) {
    return;
  }
  loadStarted = true;

  if (typeof document === "undefined") {
    return;
  }

  if (!document.fonts) {
    markReady();
    return;
  }

  if (document.fonts.check(FONT_SPEC)) {
    markReady();
    return;
  }

  const tryMarkReady = (): void => {
    if (!document.fonts.check(FONT_SPEC)) {
      return;
    }
    document.fonts.removeEventListener("loadingdone", tryMarkReady);
    markReady();
  };

  document.fonts.addEventListener("loadingdone", tryMarkReady);

  document.fonts
    .load(FONT_SPEC)
    .then(() => {
      tryMarkReady();
    })
    .catch(() => {});
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensureLoad();
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): boolean {
  return isReady;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMaterialSymbolsFontReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
