import { describe, expect, it } from "vitest";

import {
  buildErrorDebugText,
  isAbortError,
  isNetworkTypeError,
  mapStatusToKind,
  normalizeApiError,
} from "../../src/error-handling/app-error";

function responseError(status: number, body?: unknown): Error {
  const error = new Error("Response returned an error code");
  error.name = "ResponseError";
  (error as unknown as { response: Response }).response = new Response(
    body === undefined ? null : JSON.stringify(body),
    { status }
  );
  return error;
}

describe("mapStatusToKind", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [422, "validation"],
    [500, "server"],
    [501, "server"],
    [502, "unavailable"],
    [503, "unavailable"],
    [504, "unavailable"],
    [400, "generic"],
    [418, "generic"],
  ] as const)("%i → %s", (status, kind) => {
    expect(mapStatusToKind(status)).toBe(kind);
  });
});

describe("normalizeApiError: ResponseError", () => {
  it("извлекает статус и detail-строку (FastAPI)", async () => {
    const appError = await normalizeApiError(
      responseError(404, { detail: "Collection not found" })
    );
    expect(appError).toMatchObject({
      status: 404,
      kind: "not_found",
      serverMessage: "Collection not found",
    });
  });

  it("422: detail[] → validationItems + склейка msg через '; '", async () => {
    const appError = await normalizeApiError(
      responseError(422, {
        detail: [
          { loc: ["body", "title"], msg: "field required", type: "missing" },
          { loc: ["body", "query"], msg: "invalid query", type: "value_error" },
        ],
      })
    );
    expect(appError.kind).toBe("validation");
    expect(appError.serverMessage).toBe("field required; invalid query");
    expect(appError.validationItems).toEqual([
      { loc: ["body", "title"], msg: "field required" },
      { loc: ["body", "query"], msg: "invalid query" },
    ]);
  });

  it("приоритет полей: detail важнее message, message важнее error и title", async () => {
    expect(
      (await normalizeApiError(responseError(500, { detail: "a", message: "b" }))).serverMessage
    ).toBe("a");
    expect(
      (await normalizeApiError(responseError(500, { message: "b", error: "c", title: "d" })))
        .serverMessage
    ).toBe("b");
    expect(
      (await normalizeApiError(responseError(500, { error: "c", title: "d" }))).serverMessage
    ).toBe("c");
    expect((await normalizeApiError(responseError(500, { title: "d" }))).serverMessage).toBe("d");
  });

  it("нечитаемое тело — kind по статусу, без serverMessage", async () => {
    const error = new Error("Response returned an error code");
    error.name = "ResponseError";
    (error as unknown as { response: Response }).response = new Response("<html>oops</html>", {
      status: 503,
    });
    const appError = await normalizeApiError(error);
    expect(appError).toMatchObject({ status: 503, kind: "unavailable" });
    expect(appError.serverMessage).toBeUndefined();
  });
});

describe("normalizeApiError: не-HTTP ошибки", () => {
  it("FetchError → network, status 0", async () => {
    const error = new Error("fetch failed");
    error.name = "FetchError";
    expect(await normalizeApiError(error)).toMatchObject({ status: 0, kind: "network" });
  });

  it("TypeError Failed to fetch → network, status 0", async () => {
    expect(await normalizeApiError(new TypeError("Failed to fetch"))).toMatchObject({
      status: 0,
      kind: "network",
    });
  });

  it("прочий TypeError → generic", async () => {
    expect(await normalizeApiError(new TypeError("x is not a function"))).toMatchObject({
      status: 0,
      kind: "generic",
      serverMessage: "x is not a function",
    });
  });

  it("обычный Error → generic с message", async () => {
    const appError = await normalizeApiError(new Error("boom"));
    expect(appError).toMatchObject({ status: 0, kind: "generic", serverMessage: "boom" });
  });

  it("не-объект → generic без message", async () => {
    const appError = await normalizeApiError("string error");
    expect(appError).toMatchObject({ status: 0, kind: "generic" });
    expect(appError.serverMessage).toBeUndefined();
  });
});

describe("isAbortError", () => {
  it("распознаёт AbortError и code 20, не трогает остальные", () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    expect(isAbortError(abort)).toBe(true);
    expect(isAbortError(new Error("x"))).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});

describe("isNetworkTypeError", () => {
  it("распознаёт браузерные network TypeError", () => {
    expect(isNetworkTypeError(new TypeError("Failed to fetch"))).toBe(true);
    expect(
      isNetworkTypeError(new TypeError("NetworkError when attempting to fetch resource."))
    ).toBe(true);
    expect(isNetworkTypeError(new TypeError("Load failed"))).toBe(true);
    expect(isNetworkTypeError(new TypeError("Network request failed"))).toBe(true);
  });

  it("не трогает прочие TypeError и не-TypeError", () => {
    expect(isNetworkTypeError(new TypeError("x is not a function"))).toBe(false);
    expect(isNetworkTypeError(new Error("Failed to fetch"))).toBe(false);
    expect(isNetworkTypeError(undefined)).toBe(false);
  });
});

describe("диагностика собирается из Response", () => {
  it("url, статус и сырое тело попадают в diagnostics и в debug-текст", async () => {
    const appError = await normalizeApiError(responseError(500, { detail: "boom" }));

    expect(appError.diagnostics).toMatchObject({
      status: 500,
      responseBody: '{"detail":"boom"}',
    });
    expect(typeof appError.diagnostics?.timestamp).toBe("string");

    const text = buildErrorDebugText(appError);
    expect(text).toContain("Status: 500 (server)");
    expect(text).toContain("Message: boom");
    expect(text).toContain('Response body:\n{"detail":"boom"}');
  });

  it("нечитаемое json-тело всё равно сохраняется сырым", async () => {
    const error = new Error("Response returned an error code");
    error.name = "ResponseError";
    (error as unknown as { response: Response }).response = new Response("<html>oops</html>", {
      status: 503,
    });

    const appError = await normalizeApiError(error);

    expect(appError.serverMessage).toBeUndefined();
    expect(appError.diagnostics?.responseBody).toBe("<html>oops</html>");
  });

  it("сетевая ошибка: diagnostics нет (Response отсутствует)", async () => {
    const error = new Error("fetch failed");
    error.name = "FetchError";
    const appError = await normalizeApiError(error);
    expect(appError).toMatchObject({ kind: "network" });
    expect(appError.diagnostics).toBeUndefined();
  });
});
