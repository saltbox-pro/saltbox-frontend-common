export const UPLOAD_PROGRESS_EMIT_INTERVAL_MS = 100;

export function shouldEmitUploadProgress(options: {
  loaded: number;
  total: number;
  lastEmittedAt: number | null;
  now?: number;
  intervalMs?: number;
}): boolean {
  const {
    loaded,
    total,
    lastEmittedAt,
    now = Date.now(),
    intervalMs = UPLOAD_PROGRESS_EMIT_INTERVAL_MS,
  } = options;
  if (loaded >= total) {
    return true;
  }
  if (lastEmittedAt == null) {
    return true;
  }
  return now - lastEmittedAt >= intervalMs;
}
