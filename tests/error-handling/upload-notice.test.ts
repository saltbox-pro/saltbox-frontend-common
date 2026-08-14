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

import { resetUploadNoticeForTests, transferNotice } from "../../src/error-handling/upload-notice";
import { publish } from "../../src/utils/custom-events";

vi.stubGlobal("document", {});

beforeEach(() => {
  listeners.clear();
  vi.clearAllMocks();
  resetUploadNoticeForTests();
  delete (globalThis as { window?: unknown }).window;
  vi.stubGlobal("window", {});
});

describe("transferNotice", () => {
  it("host готов → публикует UiEvent.UploadNotice сразу", () => {
    (window as Window).__saltboxUploadNoticeHostReady = true;

    transferNotice.remove("k1");

    expect(publish).toHaveBeenCalledWith(UiEvent.UploadNotice, { action: "remove", key: "k1" });
  });

  it("host не готов → буферизует и сливает по UploadNoticeHostReady", () => {
    transferNotice.patch({ key: "k1", title: "Загрузка", canClose: false });
    expect(publish).not.toHaveBeenCalledWith(UiEvent.UploadNotice, expect.anything());

    (window as Window).__saltboxUploadNoticeHostReady = true;
    (publish as ReturnType<typeof vi.fn>)(UiEvent.UploadNoticeHostReady, undefined);

    expect(publish).toHaveBeenCalledWith(UiEvent.UploadNotice, {
      action: "patch",
      key: "k1",
      title: "Загрузка",
      canClose: false,
    });
  });
});
