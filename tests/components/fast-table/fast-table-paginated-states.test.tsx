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
  it("hides default columns in both headers and rows", () => {
    const { container } = render(
      <FastTablePaginated<Row>
        tableId="test-fast-table-paginated-hidden"
        columns={[
          ...columns,
          columnHelper.display({
            id: "technical",
            header: "Technical",
            cell: () => "Hidden value",
          }),
        ]}
        defaultHiddenColumnIds={["technical"]}
        data={[{ id: "job-1" }]}
        pagination={{ pageIndex: 0, pageSize: 50 }}
        onLazyLoad={vi.fn()}
      />
    );

    expect(container.textContent).toContain("job-1");
    expect(container.querySelectorAll("thead th")).toHaveLength(1);
    expect(container.textContent).not.toContain("Technical");
    expect(container.textContent).not.toContain("Hidden value");
  });

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
