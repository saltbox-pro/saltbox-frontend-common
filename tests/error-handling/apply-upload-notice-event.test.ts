import { describe, expect, it, vi } from "vitest";

import { applyUploadNoticeEvent } from "../../src/error-handling/apply-upload-notice-event";
import type { FileBrowserUploadItem } from "../../src/components/file-browser/model/upload-types";

const sampleUpload = (overrides?: Partial<FileBrowserUploadItem>): FileBrowserUploadItem => ({
  fileName: "a.txt",
  loaded: 0,
  total: 10,
  status: "uploading",
  ...overrides,
});

describe("applyUploadNoticeEvent", () => {
  it("upsert создаёт notice", () => {
    const onCancelUpload = vi.fn();
    const onClose = vi.fn();
    const next = applyUploadNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      uploads: [["u1", sampleUpload()]],
      onCancelUpload,
      onClose,
    });

    expect(next.size).toBe(1);
    expect(next.get("k1")).toMatchObject({
      title: "Загрузка",
      canClose: false,
      uploads: [["u1", sampleUpload()]],
      onCancelUpload,
      onClose,
    });
  });

  it("patch обновляет поля существующего notice", () => {
    const onCancelUpload = vi.fn();
    const onClose = vi.fn();
    const prev = applyUploadNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      uploads: [["u1", sampleUpload()]],
      onCancelUpload,
      onClose,
    });

    const next = applyUploadNoticeEvent(prev, {
      action: "patch",
      key: "k1",
      title: "Готово",
      canClose: true,
      uploads: [["u1", sampleUpload({ status: "done", loaded: 10 })]],
    });

    expect(next.get("k1")).toMatchObject({
      title: "Готово",
      canClose: true,
      onCancelUpload,
      onClose,
    });
    expect(next.get("k1")?.uploads[0][1].status).toBe("done");
  });

  it("patch без существующего key — no-op", () => {
    const prev = new Map();
    const next = applyUploadNoticeEvent(prev, {
      action: "patch",
      key: "missing",
      title: "x",
    });
    expect(next).toBe(prev);
  });

  it("remove удаляет notice", () => {
    const prev = applyUploadNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      uploads: [],
      onCancelUpload: vi.fn(),
      onClose: vi.fn(),
    });

    const next = applyUploadNoticeEvent(prev, { action: "remove", key: "k1" });
    expect(next.size).toBe(0);
  });

  it("remove отсутствующего key — no-op", () => {
    const prev = new Map();
    const next = applyUploadNoticeEvent(prev, { action: "remove", key: "missing" });
    expect(next).toBe(prev);
  });
});
