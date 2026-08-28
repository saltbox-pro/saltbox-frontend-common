export type BrowserFileDownloadProgress = (loaded: number, total: number) => void;

export type BrowserFileDownloadTarget =
  | {
      mode: "stream";
      writable: FileSystemWritableFileStream;
    }
  | {
      mode: "blob";
    };

export class BrowserFileDownloadAbortError extends Error {
  constructor() {
    super("Browser file download aborted");
    this.name = "BrowserFileDownloadAbortError";
  }
}

export class BrowserFileDownloadIncompleteError extends Error {
  constructor() {
    super("Browser file download incomplete");
    this.name = "BrowserFileDownloadIncompleteError";
  }
}

export class BrowserFileDownloadTooLargeError extends Error {
  constructor() {
    super("Browser file download too large");
    this.name = "BrowserFileDownloadTooLargeError";
  }
}

export const BLOB_DOWNLOAD_MAX_BYTES = 100 * 1024 * 1024;

function parseContentLength(response: Response): number {
  if (hasUnreliableContentLength(response)) {
    return 0;
  }
  const headerTotal = Number(response.headers.get("content-length"));
  if (Number.isFinite(headerTotal) && headerTotal > 0) {
    return headerTotal;
  }
  return 0;
}

function hasUnreliableContentLength(response: Response): boolean {
  const encoding = response.headers.get("content-encoding");
  return encoding != null && encoding !== "" && encoding.toLowerCase() !== "identity";
}

export function assertDownloadComplete(
  loaded: number,
  contentLength: number,
  knownTotal?: number
): void {
  if (contentLength > 0) {
    if (loaded !== contentLength) {
      throw new BrowserFileDownloadIncompleteError();
    }
    return;
  }
  if (typeof knownTotal === "number" && Number.isFinite(knownTotal) && knownTotal > 0) {
    if (loaded < knownTotal) {
      throw new BrowserFileDownloadIncompleteError();
    }
  }
}

function assertBlobDownloadAllowed(loadedOrExpected: number, maxBlobBytes?: number): void {
  if (maxBlobBytes == null || maxBlobBytes <= 0) {
    return;
  }
  if (loadedOrExpected > maxBlobBytes) {
    throw new BrowserFileDownloadTooLargeError();
  }
}

type ShowSaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
};

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options?: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
};

function canUseSaveFilePicker(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as SaveFilePickerWindow).showSaveFilePicker === "function"
  );
}

function isUserAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError") ||
    error instanceof BrowserFileDownloadAbortError
  );
}

export async function createBrowserFileDownloadTarget(
  fileName: string
): Promise<BrowserFileDownloadTarget> {
  if (!canUseSaveFilePicker()) {
    return { mode: "blob" };
  }

  let handle: FileSystemFileHandle;
  try {
    handle = await (window as SaveFilePickerWindow).showSaveFilePicker!({
      suggestedName: fileName,
    });
  } catch (error) {
    if (isUserAbortError(error)) {
      throw new BrowserFileDownloadAbortError();
    }
    return { mode: "blob" };
  }

  try {
    const writable = await handle.createWritable();
    return { mode: "stream", writable };
  } catch (error) {
    if (isUserAbortError(error)) {
      throw new BrowserFileDownloadAbortError();
    }
    throw error;
  }
}

export async function abortBrowserFileDownloadTarget(
  target: BrowserFileDownloadTarget | null | undefined
): Promise<void> {
  if (target?.mode !== "stream") {
    return;
  }
  try {
    await target.writable.abort();
  } catch {
    // ignore abort errors on already-closed streams
  }
}

function resolveTotalHint(contentLength: number, knownTotal?: number): number {
  if (contentLength > 0) {
    return contentLength;
  }
  if (typeof knownTotal === "number" && Number.isFinite(knownTotal) && knownTotal > 0) {
    return knownTotal;
  }
  return 0;
}

async function writeResponseToWritable(options: {
  response: Response;
  writable: FileSystemWritableFileStream;
  signal?: AbortSignal;
  knownTotal?: number;
  onProgress?: BrowserFileDownloadProgress;
}): Promise<void> {
  const { response, writable, signal, knownTotal, onProgress } = options;
  const contentLength = parseContentLength(response);
  const totalHint = resolveTotalHint(contentLength, knownTotal);

  if (signal?.aborted) {
    await writable.abort();
    throw new BrowserFileDownloadAbortError();
  }

  if (response.body == null || typeof response.body.getReader !== "function") {
    const blob = await response.blob();
    if (signal?.aborted) {
      await writable.abort();
      throw new BrowserFileDownloadAbortError();
    }
    assertDownloadComplete(blob.size, contentLength, knownTotal);
    await writable.write(blob);
    // All bytes are already on disk — finalize even if the user cancelled at 100%.
    await writable.close();
    onProgress?.(blob.size, totalHint > 0 ? Math.max(totalHint, blob.size) : blob.size);
    return;
  }

  const reader = response.body.getReader();
  let loaded = 0;

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        throw new BrowserFileDownloadAbortError();
      }

      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value != null && value.byteLength > 0) {
        await writable.write(value);
        loaded += value.byteLength;
        onProgress?.(loaded, totalHint > 0 ? totalHint : 0);
      }
    }

    assertDownloadComplete(loaded, contentLength, knownTotal);
    // All bytes are already on disk — finalize even if the user cancelled at 100%.
    await writable.close();
    onProgress?.(loaded, totalHint > 0 ? Math.max(totalHint, loaded) : loaded);
  } catch (error) {
    try {
      await writable.abort();
    } catch {
      // ignore
    }
    if (isUserAbortError(error) || signal?.aborted) {
      throw new BrowserFileDownloadAbortError();
    }
    throw error;
  }
}

async function writeResponseViaBlobDownload(options: {
  response: Response;
  fileName: string;
  signal?: AbortSignal;
  knownTotal?: number;
  maxBlobBytes?: number;
  onProgress?: BrowserFileDownloadProgress;
}): Promise<void> {
  const { response, fileName, signal, knownTotal, maxBlobBytes, onProgress } = options;
  const contentLength = parseContentLength(response);
  const totalHint = resolveTotalHint(contentLength, knownTotal);
  assertBlobDownloadAllowed(totalHint > 0 ? totalHint : 0, maxBlobBytes);

  if (signal?.aborted) {
    throw new BrowserFileDownloadAbortError();
  }

  if (response.body == null || typeof response.body.getReader !== "function") {
    const blob = await response.blob();
    if (signal?.aborted) {
      throw new BrowserFileDownloadAbortError();
    }
    assertBlobDownloadAllowed(blob.size, maxBlobBytes);
    assertDownloadComplete(blob.size, contentLength, knownTotal);
    onProgress?.(blob.size, totalHint > 0 ? Math.max(totalHint, blob.size) : blob.size);
    // Body is fully buffered — save even if the user cancelled at 100%.
    triggerBlobDownload(blob, fileName);
    return;
  }

  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  let loaded = 0;

  while (true) {
    if (signal?.aborted) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      throw new BrowserFileDownloadAbortError();
    }

    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value != null && value.byteLength > 0) {
      chunks.push(value);
      loaded += value.byteLength;
      assertBlobDownloadAllowed(loaded, maxBlobBytes);
      onProgress?.(loaded, totalHint > 0 ? totalHint : 0);
    }
  }

  const blob = new Blob(chunks);
  assertDownloadComplete(blob.size, contentLength, knownTotal);
  onProgress?.(blob.size, totalHint > 0 ? Math.max(totalHint, blob.size) : blob.size);
  // Body is fully buffered — save even if the user cancelled at 100%.
  triggerBlobDownload(blob, fileName);
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60_000);
}

export async function writeResponseToBrowserFile(options: {
  response: Response;
  fileName: string;
  target: BrowserFileDownloadTarget;
  signal?: AbortSignal;
  knownTotal?: number;
  maxBlobBytes?: number;
  onProgress?: BrowserFileDownloadProgress;
}): Promise<void> {
  const { response, fileName, target, signal, knownTotal, maxBlobBytes, onProgress } = options;

  if (target.mode === "stream") {
    await writeResponseToWritable({
      response,
      writable: target.writable,
      signal,
      knownTotal,
      onProgress,
    });
    return;
  }

  await writeResponseViaBlobDownload({
    response,
    fileName,
    signal,
    knownTotal,
    maxBlobBytes,
    onProgress,
  });
}
