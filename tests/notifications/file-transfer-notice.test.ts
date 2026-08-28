import { beforeEach, describe, expect, it, vi } from "vitest";

import { UiEvent } from "../../src/interfaces/ui-events";

const listeners = new Map<string, Array<(event: { detail: unknown }) => void>>();
vi.mock("../../src/utils/custom-events", () => ({
  publish: vi.fn((name: string, data: unknown) => {
    (listeners.get(name) ?? []).forEach((listener) => listener({ detail: data }));
  }),
  subscribe: vi.fn((name: string, listener: (event: { detail: unknown }) => void) => {
    listeners.set(name, [...(listeners.get(name) ?? []), listener]);
  }),
  unsubscribe: vi.fn(),
}));

import {
  fileTransferNotice,
  resetFileTransferNoticeForTests,
} from "../../src/notifications/model/file-transfer-notice";
import { publish } from "../../src/utils/custom-events";

vi.stubGlobal("document", {});

beforeEach(() => {
  listeners.clear();
  vi.clearAllMocks();
  resetFileTransferNoticeForTests();
  delete (globalThis as { window?: unknown }).window;
  vi.stubGlobal("window", {});
});

describe("fileTransferNotice", () => {
  it("host готов → публикует UiEvent.FileTransferNotice сразу", () => {
    (window as Window).__saltboxFileTransferNoticeHostReady = true;

    fileTransferNotice.remove("k1");

    expect(publish).toHaveBeenCalledWith(UiEvent.FileTransferNotice, {
      action: "remove",
      key: "k1",
    });
  });

  it("host не готов → буферизует и сливает по FileTransferNoticeHostReady", () => {
    fileTransferNotice.patch({ key: "k1", title: "Загрузка", canClose: false });
    expect(publish).not.toHaveBeenCalledWith(UiEvent.FileTransferNotice, expect.anything());

    (window as Window).__saltboxFileTransferNoticeHostReady = true;
    (publish as ReturnType<typeof vi.fn>)(UiEvent.FileTransferNoticeHostReady, undefined);

    expect(publish).toHaveBeenCalledWith(UiEvent.FileTransferNotice, {
      action: "patch",
      key: "k1",
      title: "Загрузка",
      canClose: false,
    });
  });
});
