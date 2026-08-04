import { describe, expect, it } from "vitest";

import type { AppError } from "../../src/error-handling/app-error";
import {
  formatErrorCode,
  resolveHttpErrorPresentation,
} from "../../src/error-handling/ui/resolve-http-error-presentation";

// t возвращает сам ключ — проверяем структуру, а не переводы
const t = ((key: string) => key) as never;

const makeError = (status: number, kind: AppError["kind"], serverMessage?: string): AppError => ({
  status,
  kind,
  serverMessage,
  raw: null,
});

describe("formatErrorCode", () => {
  it("HTTP-ошибка: код и расшифровка вместе", () => {
    expect(formatErrorCode(500, "server", t)).toBe("500 · errors.page.server-error-title");
    expect(formatErrorCode(404, "not_found", t)).toBe("404 · errors.page.not-found-title");
  });

  it("сетевая ошибка (status 0): только расшифровка, без нуля", () => {
    expect(formatErrorCode(0, "network", t)).toBe("errors.page.network-error-title");
  });
});

describe("resolveHttpErrorPresentation", () => {
  it("codeLine доступен всем поверхностям", () => {
    expect(resolveHttpErrorPresentation(makeError(409, "conflict"), t).codeLine).toBe(
      "409 · errors.page.conflict-title"
    );
  });

  it("сообщение бекенда замещает стандартный подзаголовок", () => {
    const presentation = resolveHttpErrorPresentation(makeError(409, "conflict", "Слаг занят"), t);
    expect(presentation.subtitle).toBe("Слаг занят");
    expect(presentation.title).toBe("errors.page.conflict-title");
  });

  it("пустой serverMessage не затирает подзаголовок", () => {
    expect(resolveHttpErrorPresentation(makeError(500, "server", "   "), t).subtitle).toBe(
      "errors.page.server-error"
    );
  });
});
