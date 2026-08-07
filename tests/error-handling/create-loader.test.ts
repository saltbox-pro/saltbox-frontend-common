import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { createKeyedLoader, createLoader } from "../../src/error-handling/create-loader";
import { UiEvent } from "../../src/interfaces/ui-events";

vi.mock("../../src/utils/custom-events", () => ({
  publish: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));

import { publish } from "../../src/utils/custom-events";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function responseError(status: number): Error {
  const error = new Error("Response returned an error code");
  error.name = "ResponseError";
  (error as unknown as { response: Response }).response = new Response(null, { status });
  return error;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createLoader: базовый цикл", () => {
  it("success: статус, onSuccess с данными и аргументами", async () => {
    const onSuccess = vi.fn();
    const loader = createLoader({
      run: (id: string) => Promise.resolve(`data-${id}`),
      onSuccess,
    });

    const running = loader.run("42");
    expect(loader.isLoading).toBe(true);
    await running;

    expect(loader.status).toBe("success");
    expect(loader.error).toBeNull();
    expect(loader.isInitialLoad).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith("data-42", "42");
  });

  it("error: нормализованная ошибка в состоянии, run не реджектится", async () => {
    const loader = createLoader({ run: () => Promise.reject(responseError(404)) });

    await loader.run();

    expect(loader.status).toBe("error");
    expect(loader.error).toMatchObject({ status: 404, kind: "not_found" });
    expect(loader.isInitialLoad).toBe(true);
  });

  it("исключение в onSuccess — баг маппинга, а не ошибка загрузки", async () => {
    const loader = createLoader({
      run: () => Promise.resolve("data"),
      onSuccess: () => {
        throw new Error("Ошибка маппинга ответа");
      },
    });

    await expect(loader.run()).rejects.toThrow("Ошибка маппинга ответа");

    expect(loader.status).toBe("success");
    expect(loader.error).toBeNull();
    expect(publish).not.toHaveBeenCalled();
  });

  it("undefined от run (API не готов) → откат в idle", async () => {
    const loader = createLoader({ run: () => undefined });
    await loader.run();
    expect(loader.status).toBe("idle");
  });

  it("retry повторяет с последними аргументами", async () => {
    const run = vi.fn((id: string) => Promise.resolve(id));
    const loader = createLoader({ run });

    await loader.run("first");
    loader.retry();
    await vi.runAllTimersAsync();

    expect(run).toHaveBeenNthCalledWith(2, "first");
  });

  it("AbortError: не ошибка; возврат к success после успеха, к idle до него", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";

    const loader = createLoader({ run: () => Promise.reject(abort) });
    await loader.run();
    expect(loader.status).toBe("idle");

    let fail = false;
    const loader2 = createLoader({
      run: () => (fail ? Promise.reject(abort) : Promise.resolve(1)),
    });
    await loader2.run();
    fail = true;
    await loader2.run();
    expect(loader2.status).toBe("success");
  });
});

describe("createLoader: гонки (seq-guard)", () => {
  it("поздний успех устаревшего запроса отбрасывается", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const results: string[] = [];
    let call = 0;
    const loader = createLoader({
      run: () => (++call === 1 ? first.promise : second.promise),
      onSuccess: (data) => results.push(data),
    });

    const run1 = loader.run();
    const run2 = loader.run();
    second.resolve("new");
    first.resolve("stale");
    await Promise.all([run1, run2]);

    expect(results).toEqual(["new"]);
    expect(loader.status).toBe("success");
  });

  it("поздняя ошибка устаревшего запроса не перетирает свежие данные", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    let call = 0;
    const loader = createLoader({
      run: () => (++call === 1 ? first.promise : second.promise),
    });

    const run1 = loader.run();
    const run2 = loader.run();
    second.resolve("new");
    first.reject(responseError(500));
    await Promise.all([run1, run2]);

    expect(loader.status).toBe("success");
    expect(loader.error).toBeNull();
  });
});

describe("createLoader: isInitialLoad / refresh", () => {
  it("после первого успеха ошибка обновления не возвращает isInitialLoad", async () => {
    let fail = false;
    const loader = createLoader({
      run: () => (fail ? Promise.reject(responseError(500)) : Promise.resolve(1)),
    });

    await loader.run();
    fail = true;
    await loader.run();

    expect(loader.status).toBe("error");
    expect(loader.isInitialLoad).toBe(false); // зона покажет «не удалось обновить», не блок
  });
});

describe("createLoader: bind-счётчик и страховочная сетка", () => {
  it("ошибка без привязок → UnhandledLoadError", async () => {
    const loader = createLoader({ run: () => Promise.reject(responseError(500)) });
    await loader.run();
    await vi.runAllTimersAsync();

    expect(publish).toHaveBeenCalledWith(
      UiEvent.UnhandledLoadError,
      expect.objectContaining({ status: 500, kind: "server" })
    );
  });

  it("с привязкой (bind) событие не публикуется", async () => {
    const loader = createLoader({ run: () => Promise.reject(responseError(500)) });
    loader.bind();
    await loader.run();
    await vi.runAllTimersAsync();

    expect(publish).not.toHaveBeenCalledWith(UiEvent.UnhandledLoadError, expect.anything());
  });
});

describe("createKeyedLoader", () => {
  it("независимые состояния по ключам; заглушка до запуска", async () => {
    const keyed = createKeyedLoader({
      run: (key: string) =>
        key === "bad" ? Promise.reject(responseError(404)) : Promise.resolve(key),
    });

    expect(keyed.state("a").status).toBe("idle");

    await keyed.run("a");
    await keyed.run("bad");

    expect(keyed.state("a").status).toBe("success");
    expect(keyed.state("bad").error).toMatchObject({ kind: "not_found" });
    expect(keyed.state("untouched").status).toBe("idle");
  });
});
