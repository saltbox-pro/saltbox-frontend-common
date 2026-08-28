import { beforeEach, describe, expect, it, vi } from "vitest";

import { UiEvent } from "../../src/interfaces/ui-events";

// Мини-шина в памяти вместо document-события (node-окружение)
const listeners = new Map<string, Array<(event: { detail: unknown }) => void>>();
vi.mock("../../src/utils/custom-events", () => ({
  publish: vi.fn((name: string, data: unknown) => {
    (listeners.get(name) ?? []).forEach((listener) => listener({ detail: data }));
  }),
  subscribe: vi.fn((name: string, listener: (event: { detail: unknown }) => void) => {
    listeners.set(name, [...(listeners.get(name) ?? []), listener]);
  }),
  unsubscribe: vi.fn(),
}));

import { notify, resetNotifyForTests } from "../../src/notifications/model/notify";
import { publish } from "../../src/utils/custom-events";

// notify проверяет document для подписки — подставим заглушку
vi.stubGlobal("document", {});

beforeEach(() => {
  listeners.clear();
  vi.clearAllMocks();
  resetNotifyForTests();
  delete (globalThis as { window?: unknown }).window;
  vi.stubGlobal("window", {});
});

describe("notify", () => {
  it("host готов → публикует UiEvent.Toast сразу", () => {
    (window as Window).__saltboxToastHostReady = true;

    notify.success("Готово");

    expect(publish).toHaveBeenCalledWith(UiEvent.Toast, { type: "success", title: "Готово" });
  });

  it("host не готов → буферизует и сливает по ToastHostReady", () => {
    notify.error({ title: "Не удалось удалить", description: "конфликт" });
    expect(publish).not.toHaveBeenCalledWith(UiEvent.Toast, expect.anything());

    // host маунтится: ставит флаг и публикует ready
    (window as Window).__saltboxToastHostReady = true;
    (publish as ReturnType<typeof vi.fn>)(UiEvent.ToastHostReady, undefined);

    expect(publish).toHaveBeenCalledWith(UiEvent.Toast, {
      type: "error",
      title: "Не удалось удалить",
      description: "конфликт",
    });
  });

  it("строка как вход — сокращение для { title }", () => {
    (window as Window).__saltboxToastHostReady = true;
    notify.warning("Внимание");
    expect(publish).toHaveBeenCalledWith(UiEvent.Toast, { type: "warning", title: "Внимание" });
  });
});
