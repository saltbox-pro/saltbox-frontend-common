import { type UserSettingsChangedEventDetail, UiEvent } from "saltbox-common/interfaces/ui-events";
import { publish, subscribe } from "saltbox-common/utils/custom-events";

const SAVE_DELAY_MS = 400;
const PATH_SEPARATOR = "/";

export type UserSettingsTransport = {
  load: () => Promise<Record<string, unknown>>;
  save: (settings: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export type UserSettingsApiLike = {
  getUserSettings: () => Promise<Record<string, unknown>>;
  createOrUpdateUserSettings: (params: {
    request_body: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
};

export function createUserSettingsTransport(
  getApi: () => UserSettingsApiLike | undefined
): UserSettingsTransport {
  const requireApi = (): UserSettingsApiLike => {
    const api = getApi();
    if (!api) throw new Error("User settings API is not available");

    return api;
  };

  return {
    load: async () => await requireApi().getUserSettings(),
    save: async (settings) =>
      await requireApi().createOrUpdateUserSettings({ request_body: settings }),
  };
}

const listeners = new Set<() => void>();

let transport: UserSettingsTransport | null = null;
let settings: Record<string, unknown> = {};
let dirtyPaths = new Set<string>();
let loadPromise: Promise<void> | null = null;
let saveChain: Promise<void> = Promise.resolve();
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let isSubscribedToChanges = false;
let isPublishingOwnChange = false;

function notify(): void {
  listeners.forEach((listener) => listener());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function readPath(source: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = source;

  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function writePath(
  source: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  const [key, ...rest] = path;
  const next = { ...source };

  if (rest.length === 0) {
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    return next;
  }

  const child = isRecord(next[key]) ? next[key] : {};
  const updatedChild = writePath(child, rest, value);

  if (Object.keys(updatedChild).length === 0) {
    delete next[key];
  } else {
    next[key] = updatedChild;
  }

  return next;
}

function applyDirtyPaths(
  target: Record<string, unknown>,
  paths: Iterable<string>
): Record<string, unknown> {
  let next = target;

  for (const key of paths) {
    const path = key.split(PATH_SEPARATOR);
    next = writePath(next, path, readPath(settings, path));
  }

  return next;
}

function adoptSettings(next: Record<string, unknown>): void {
  settings = applyDirtyPaths(next, dirtyPaths);
  notify();
}

function publishOwnChange(next: Record<string, unknown>): void {
  isPublishingOwnChange = true;
  try {
    publish<UserSettingsChangedEventDetail>(UiEvent.UserSettingsChanged, { settings: next });
  } finally {
    isPublishingOwnChange = false;
  }
}

function handleForeignChange(event: CustomEvent): void {
  if (isPublishingOwnChange) return;

  const detail = event.detail as UserSettingsChangedEventDetail | undefined;
  if (!detail || !isRecord(detail.settings)) return;

  adoptSettings(detail.settings);
}

async function writeSettings(pendingPaths: string[]): Promise<void> {
  const activeTransport = transport;
  if (!activeTransport) return;

  try {
    const stored = await activeTransport.load();
    if (transport !== activeTransport) return;

    const next = applyDirtyPaths(isRecord(stored) ? stored : {}, pendingPaths);
    const saved = await activeTransport.save(next);
    if (transport !== activeTransport) return;

    const result = isRecord(saved) ? saved : next;
    adoptSettings(result);
    publishOwnChange(result);
  } catch (error) {
    console.error("Failed to save user settings", error);
  }
}

function runSave(): void {
  if (!transport || dirtyPaths.size === 0) return;

  const pendingPaths = [...dirtyPaths];
  dirtyPaths = new Set();
  saveChain = saveChain.then(() => writeSettings(pendingPaths));
}

function scheduleSave(): void {
  if (!transport) return;

  if (saveTimeout !== null) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    runSave();
  }, SAVE_DELAY_MS);
}

export function initUserSettings(nextTransport: UserSettingsTransport): void {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  transport = nextTransport;
  settings = {};
  dirtyPaths = new Set();
  loadPromise = null;
  saveChain = Promise.resolve();

  if (!isSubscribedToChanges) {
    subscribe(UiEvent.UserSettingsChanged, handleForeignChange);
    isSubscribedToChanges = true;
  }

  notify();
  ensureUserSettingsLoaded();
}

export function ensureUserSettingsLoaded(): Promise<void> {
  const activeTransport = transport;
  if (!activeTransport) return Promise.resolve();

  if (!loadPromise) {
    loadPromise = activeTransport
      .load()
      .then((stored) => {
        if (transport !== activeTransport) return;
        adoptSettings(isRecord(stored) ? stored : {});
      })
      .catch((error: unknown) => {
        loadPromise = null;
        console.error("Failed to load user settings", error);
      });
  }

  return loadPromise;
}

export function getUserSettingsValue(path: string[]): unknown {
  return readPath(settings, path);
}

export function setUserSettingsValue(path: string[], value: unknown): void {
  if (path.length === 0) return;
  if (isSameValue(readPath(settings, path), value)) return;

  settings = writePath(settings, path, value);
  dirtyPaths.add(path.join(PATH_SEPARATOR));
  notify();
  scheduleSave();
}

export function subscribeUserSettings(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
