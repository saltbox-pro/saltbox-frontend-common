import { describe, expect, it, vi } from "vitest";

import { applyFileTransferNoticeEvent } from "../../src/notifications/helpers/apply-file-transfer-notice-event";
import type { FileBrowserUploadItem } from "../../src/components/file-browser/model/upload-types";

const sampleUpload = (overrides?: Partial<FileBrowserUploadItem>): FileBrowserUploadItem => ({
  fileName: "a.txt",
  loaded: 0,
  total: 10,
  status: "uploading",
  ...overrides,
});

describe("applyFileTransferNoticeEvent", () => {
  it("upsert создаёт notice", () => {
    const onCancelTransfer = vi.fn();
    const onClose = vi.fn();
    const next = applyFileTransferNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      transfers: [["u1", sampleUpload()]],
      onCancelTransfer,
      onClose,
    });

    expect(next.size).toBe(1);
    expect(next.get("k1")).toMatchObject({
      title: "Загрузка",
      canClose: false,
      transfers: [["u1", sampleUpload()]],
      onCancelTransfer,
      onClose,
    });
  });

  it("patch обновляет поля существующего notice", () => {
    const onCancelTransfer = vi.fn();
    const onClose = vi.fn();
    const prev = applyFileTransferNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      transfers: [["u1", sampleUpload()]],
      onCancelTransfer,
      onClose,
    });

    const next = applyFileTransferNoticeEvent(prev, {
      action: "patch",
      key: "k1",
      title: "Готово",
      canClose: true,
      transfers: [["u1", sampleUpload({ status: "done", loaded: 10 })]],
    });

    expect(next.get("k1")).toMatchObject({
      title: "Готово",
      canClose: true,
      onCancelTransfer,
      onClose,
    });
    expect(next.get("k1")?.transfers[0][1].status).toBe("done");
  });

  it("patch без существующего key — no-op", () => {
    const prev = new Map();
    const next = applyFileTransferNoticeEvent(prev, {
      action: "patch",
      key: "missing",
      title: "x",
    });
    expect(next).toBe(prev);
  });

  it("remove удаляет notice", () => {
    const prev = applyFileTransferNoticeEvent(new Map(), {
      action: "upsert",
      key: "k1",
      title: "Загрузка",
      canClose: false,
      transfers: [],
      onCancelTransfer: vi.fn(),
      onClose: vi.fn(),
    });

    const next = applyFileTransferNoticeEvent(prev, { action: "remove", key: "k1" });
    expect(next.size).toBe(0);
  });

  it("remove отсутствующего key — no-op", () => {
    const prev = new Map();
    const next = applyFileTransferNoticeEvent(prev, { action: "remove", key: "missing" });
    expect(next).toBe(prev);
  });
});
