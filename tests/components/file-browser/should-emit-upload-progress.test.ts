import { describe, expect, it } from "vitest";

import {
  shouldEmitUploadProgress,
  UPLOAD_PROGRESS_EMIT_INTERVAL_MS,
} from "../../../src/components/file-browser/utils/should-emit-upload-progress";

describe("shouldEmitUploadProgress", () => {
  it("первый тик всегда проходит", () => {
    expect(
      shouldEmitUploadProgress({ loaded: 10, total: 100, lastEmittedAt: null, now: 1000 })
    ).toBe(true);
  });

  it("внутри интервала — false", () => {
    expect(
      shouldEmitUploadProgress({
        loaded: 20,
        total: 100,
        lastEmittedAt: 1000,
        now: 1000 + UPLOAD_PROGRESS_EMIT_INTERVAL_MS - 1,
      })
    ).toBe(false);
  });

  it("после интервала — true", () => {
    expect(
      shouldEmitUploadProgress({
        loaded: 20,
        total: 100,
        lastEmittedAt: 1000,
        now: 1000 + UPLOAD_PROGRESS_EMIT_INTERVAL_MS,
      })
    ).toBe(true);
  });

  it("завершение (loaded >= total) всегда проходит", () => {
    expect(
      shouldEmitUploadProgress({
        loaded: 100,
        total: 100,
        lastEmittedAt: 1000,
        now: 1001,
      })
    ).toBe(true);
  });
});
