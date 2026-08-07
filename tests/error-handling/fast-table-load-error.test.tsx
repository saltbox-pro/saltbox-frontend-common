// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import {
  FastTableBodyFallback,
  FastTableRefreshAlert,
} from "../../src/components/fast-table/fast-table-load-error";
import type { AppError } from "../../src/error-handling/app-error";
import type { LoadSource } from "../../src/error-handling/create-loader";

beforeAll(() => {
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

afterEach(cleanup);

function appError(kind: AppError["kind"], status: number): AppError {
  return { status, kind, raw: new Error(kind) };
}

function source(overrides: Partial<LoadSource> = {}): LoadSource {
  return {
    status: "success",
    error: null,
    isLoading: false,
    isInitialLoad: false,
    retry: vi.fn(),
    bind: vi.fn(),
    unbind: vi.fn(),
    ...overrides,
  };
}

const renderRow = (row: React.ReactNode) =>
  render(
    <table>
      <tbody>{row}</tbody>
    </table>
  );

describe("FastTableBodyFallback", () => {
  it("нет ошибки — обычный Empty с переданным описанием", () => {
    renderRow(
      <FastTableBodyFallback loader={source()} colSpan={3} emptyDescription="Нет данных" />
    );

    expect(screen.getByText("Нет данных")).toBeDefined();
  });

  it("ошибка первой загрузки — error-state вместо Empty", () => {
    renderRow(
      <FastTableBodyFallback
        loader={source({ error: appError("not_found", 404), isInitialLoad: true })}
        colSpan={3}
        emptyDescription="Нет данных"
      />
    );

    expect(screen.queryByText("Нет данных")).toBeNull();
    expect(screen.getByText("errors.page.not-found-title")).toBeDefined();
  });

  it("ошибка обновления при пустом теле — остаётся Empty, ошибку показывает баннер", () => {
    renderRow(
      <FastTableBodyFallback
        loader={source({ error: appError("server", 500) })}
        colSpan={3}
        emptyDescription="Нет данных"
      />
    );

    expect(screen.getByText("Нет данных")).toBeDefined();
  });
});

describe("FastTableRefreshAlert", () => {
  it("без лоадера и без ошибки ничего не рисует", () => {
    const { container } = render(<FastTableRefreshAlert loader={source()} />);
    expect(container.firstChild).toBeNull();
  });

  it("ошибка первой загрузки — баннера нет (её показывает тело таблицы)", () => {
    const { container } = render(
      <FastTableRefreshAlert
        loader={source({ error: appError("server", 500), isInitialLoad: true })}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("ошибка обновления — баннер с повтором", () => {
    render(<FastTableRefreshAlert loader={source({ error: appError("server", 500) })} />);

    expect(screen.getByText("errors.refresh-failed")).toBeDefined();
    expect(screen.getByText("errors.page.retry")).toBeDefined();
  });
});
