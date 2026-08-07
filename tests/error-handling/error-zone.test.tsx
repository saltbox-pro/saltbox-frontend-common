// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// t возвращает ключ: проверяем выбор строки, а не перевод
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import type { AppError } from "../../src/error-handling/app-error";
import type { LoadSource } from "../../src/error-handling/create-loader";
import { ErrorZone } from "../../src/error-handling/ui/error-zone";

beforeAll(() => {
  // antd опрашивает matchMedia, в jsdom его нет
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

// vitest без globals не подключает авто-очистку RTL — иначе DOM копится между кейсами
afterEach(cleanup);

function appError(kind: AppError["kind"], status: number): AppError {
  return { status, kind, raw: new Error(kind) };
}

function source(overrides: Partial<LoadSource> = {}): LoadSource {
  return {
    status: "error",
    error: null,
    isLoading: false,
    isInitialLoad: true,
    retry: vi.fn(),
    bind: vi.fn(),
    unbind: vi.fn(),
    ...overrides,
  };
}

describe("ErrorZone", () => {
  it("без ошибок — только дети", () => {
    render(
      <ErrorZone loaders={[source({ status: "success", isInitialLoad: false })]}>
        <p>контент</p>
      </ErrorZone>
    );

    expect(screen.getByText("контент")).toBeDefined();
  });

  it("ошибка первой загрузки замещает контент", () => {
    render(
      <ErrorZone loaders={[source({ error: appError("server", 500) })]}>
        <p>контент</p>
      </ErrorZone>
    );

    expect(screen.queryByText("контент")).toBeNull();
    expect(screen.getByText("errors.page.server-error-title")).toBeDefined();
  });

  it("ошибка обновления оставляет контент и показывает баннер", () => {
    render(
      <ErrorZone loaders={[source({ error: appError("server", 500), isInitialLoad: false })]}>
        <p>контент</p>
      </ErrorZone>
    );

    expect(screen.getByText("контент")).toBeDefined();
    expect(screen.getByText("errors.refresh-failed")).toBeDefined();
  });

  it("keepContentOnError: контент остаётся даже при первой неудаче", () => {
    render(
      <ErrorZone keepContentOnError loaders={[source({ error: appError("server", 500) })]}>
        <p>контент</p>
      </ErrorZone>
    );

    expect(screen.getByText("контент")).toBeDefined();
    // текст отличается от refresh: данные не устарели, их просто нет
    expect(screen.getByText("errors.partial-load-failed")).toBeDefined();
  });

  it("из нескольких ошибок показывает самую серьёзную", () => {
    render(
      <ErrorZone
        loaders={[
          source({ error: appError("not_found", 404) }),
          source({ error: appError("network", 0) }),
        ]}
      >
        <p>контент</p>
      </ErrorZone>
    );

    expect(screen.getByText("errors.page.network-error-title")).toBeDefined();
    expect(screen.queryByText("errors.page.not-found-title")).toBeNull();
  });

  it("bind при маунте, unbind при анмаунте — иначе ошибка уйдёт в страховочную сетку", () => {
    const loader = source({ status: "success", isInitialLoad: false });

    const { unmount } = render(
      <ErrorZone loaders={[loader]}>
        <p>контент</p>
      </ErrorZone>
    );

    expect(loader.bind).toHaveBeenCalledTimes(1);
    expect(loader.unbind).not.toHaveBeenCalled();

    unmount();
    expect(loader.unbind).toHaveBeenCalledTimes(1);
  });
});
