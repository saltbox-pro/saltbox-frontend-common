// @vitest-environment jsdom
import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { FastTablePaginated } from "../../../src/components/fast-table/fast-table-paginated/fast-table-paginated";

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

type Row = { id: string };

const columnHelper = createColumnHelper<Row>();
const columns = [columnHelper.accessor("id", { header: "ID" })];

const renderPaginated = (isLoading: boolean) =>
  render(
    <FastTablePaginated<Row>
      tableId="test-fast-table-paginated"
      columns={columns}
      data={[]}
      isLoading={isLoading}
      pagination={{ pageIndex: 0, pageSize: 50 }}
      onLazyLoad={vi.fn()}
      enableColumnSettings={false}
    />
  );

describe("FastTablePaginated states", () => {
  it("does not show the empty state while an empty table is loading", () => {
    const { container } = renderPaginated(true);

    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelector(".empty-state-row")).toBeNull();
  });

  it("shows the empty state once loading is finished", () => {
    const { container } = renderPaginated(false);

    expect(container.querySelector(".empty-state-row")).not.toBeNull();
  });
});
