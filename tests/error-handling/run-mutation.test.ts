import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/utils/custom-events", () => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));
vi.mock("../../src/error-handling/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import { applyValidationErrors } from "../../src/error-handling/apply-validation-errors";
import { notify } from "../../src/error-handling/notify";
import { runMutation } from "../../src/error-handling/run-mutation";

function responseError(status: number, body?: unknown): Error {
  const error = new Error("Response returned an error code");
  error.name = "ResponseError";
  (error as unknown as { response: Response }).response = new Response(
    body === undefined ? null : JSON.stringify(body),
    { status }
  );
  return error;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runMutation", () => {
  it("успех: результат, success-тост, reload", async () => {
    const reload = vi.fn();
    const result = await runMutation({
      run: () => Promise.resolve("done"),
      errorMessage: "Не удалось",
      successMessage: "Готово",
      reload,
    });

    expect(result).toEqual({ ok: true, data: "done" });
    expect(notify.success).toHaveBeenCalledWith("Готово");
    expect(reload).toHaveBeenCalled();
  });

  it("ошибка: тост с fallback-заголовком и serverMessage, не бросает", async () => {
    const result = await runMutation({
      run: () => Promise.reject(responseError(409, { detail: "Слаг уже занят" })),
      errorMessage: "Не удалось сохранить",
    });

    expect(result.ok).toBe(false);
    expect(notify.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Не удалось сохранить",
        description: "Слаг уже занят",
        // код едет данными: расшифровку «409 · Конфликт данных» переводит ToastHost
        errorCode: { status: 409, kind: "conflict" },
        // диагностика собрана из Response — раскрывашка и копирование в тосте
        debugText: expect.stringContaining("Status: 409"),
      })
    );
  });

  it("422 с формой: ошибки в поля, тоста нет", async () => {
    const form = { setFields: vi.fn() };
    await runMutation({
      run: () =>
        Promise.reject(
          responseError(422, {
            detail: [{ loc: ["body", "title"], msg: "field required", type: "missing" }],
          })
        ),
      errorMessage: "Не удалось сохранить",
      form,
    });

    expect(form.setFields).toHaveBeenCalledWith([{ name: ["title"], errors: ["field required"] }]);
    expect(notify.error).not.toHaveBeenCalled();
  });

  it("422 без маппящихся loc: откат к тосту", async () => {
    const form = { setFields: vi.fn() };
    await runMutation({
      run: () => Promise.reject(responseError(422, { detail: [{ msg: "broken" }] })),
      errorMessage: "Не удалось",
      form,
    });

    expect(form.setFields).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalled();
  });

  it("onError (модалка): AppError уходит вызывающему, тоста нет", async () => {
    const onError = vi.fn();
    await runMutation({
      run: () => Promise.reject(responseError(500, { message: "boom" })),
      errorMessage: "Не удалось",
      onError,
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "server", serverMessage: "boom" })
    );
    expect(notify.error).not.toHaveBeenCalled();
  });
});

describe("applyValidationErrors", () => {
  it("срезает префикс источника и мапит вложенные loc", () => {
    const form = { setFields: vi.fn() };
    const ok = applyValidationErrors(form, {
      status: 422,
      kind: "validation",
      raw: null,
      validationItems: [
        { loc: ["body", "schedule", "cron"], msg: "invalid cron" },
        { loc: ["query", "page"], msg: "must be positive" },
      ],
    });

    expect(ok).toBe(true);
    expect(form.setFields).toHaveBeenCalledWith([
      { name: ["schedule", "cron"], errors: ["invalid cron"] },
      { name: ["page"], errors: ["must be positive"] },
    ]);
  });

  it("нет привязываемых элементов → false, setFields не зовётся", () => {
    const form = { setFields: vi.fn() };
    expect(applyValidationErrors(form, { status: 422, kind: "validation", raw: null })).toBe(false);
    expect(form.setFields).not.toHaveBeenCalled();
  });
});
