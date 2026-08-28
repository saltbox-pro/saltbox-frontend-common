import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertDownloadComplete,
  BrowserFileDownloadIncompleteError,
  BrowserFileDownloadTooLargeError,
  writeResponseToBrowserFile,
} from "../../../src/components/file-browser/utils/write-response-to-browser-file";

describe("assertDownloadComplete", () => {
  it("принимает точное совпадение с Content-Length", () => {
    expect(() => assertDownloadComplete(10, 10)).not.toThrow();
  });

  it("падает, если loaded !== Content-Length", () => {
    expect(() => assertDownloadComplete(11, 10)).toThrow(BrowserFileDownloadIncompleteError);
  });

  it("без Content-Length падает только если loaded < knownTotal", () => {
    expect(() => assertDownloadComplete(9, 0, 10)).toThrow(BrowserFileDownloadIncompleteError);
    expect(() => assertDownloadComplete(10, 0, 10)).not.toThrow();
    expect(() => assertDownloadComplete(12, 0, 10)).not.toThrow();
  });
});

describe("writeResponseToBrowserFile blob", () => {
  const click = vi.fn();
  const appendChild = vi.fn();
  const remove = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubBlobDownload() {
    vi.stubGlobal("document", {
      createElement: () => ({
        href: "",
        download: "",
        style: {},
        click,
        remove,
      }),
      body: { appendChild },
    });
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:test",
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
  }

  it("игнорирует Content-Length при Content-Encoding и сверяет knownTotal", async () => {
    stubBlobDownload();
    const body = "hello world";
    const response = new Response(body, {
      headers: {
        "content-length": "3",
        "content-encoding": "gzip",
      },
    });

    await expect(
      writeResponseToBrowserFile({
        response,
        fileName: "a.txt",
        target: { mode: "blob" },
        knownTotal: body.length,
      })
    ).resolves.toBeUndefined();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });

  it("без encoding падает, если body не совпал с Content-Length", async () => {
    stubBlobDownload();
    const response = new Response("hello world", {
      headers: { "content-length": "3" },
    });

    await expect(
      writeResponseToBrowserFile({
        response,
        fileName: "a.txt",
        target: { mode: "blob" },
      })
    ).rejects.toBeInstanceOf(BrowserFileDownloadIncompleteError);
  });

  it("режет blob только если передан maxBlobBytes", async () => {
    stubBlobDownload();
    const response = new Response("hello world");

    await expect(
      writeResponseToBrowserFile({
        response,
        fileName: "a.txt",
        target: { mode: "blob" },
        maxBlobBytes: 4,
      })
    ).rejects.toBeInstanceOf(BrowserFileDownloadTooLargeError);

    await expect(
      writeResponseToBrowserFile({
        response: new Response("hello world"),
        fileName: "a.txt",
        target: { mode: "blob" },
      })
    ).resolves.toBeUndefined();
  });
});
