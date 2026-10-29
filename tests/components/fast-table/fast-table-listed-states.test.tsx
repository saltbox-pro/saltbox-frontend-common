// @vitest-environment jsdom
import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  FastTableListed,
  type FastTableListedProps,
} from "../../../src/components/fast-table/fast-table-listed/fast-table-listed";

afterEach(cleanup);

type Row = { id: string };

const columnHelper = createColumnHelper<Row>();
const columns = [columnHelper.accessor("id", { header: "ID" })];

const renderListed = (props: Partial<FastTableListedProps<Row>>) =>
  render(
    <FastTableListed<Row>
      tableId="test-fast-table-listed"
      columns={columns}
      data={[]}
      enableColumnSettings={false}
      hideFooter
      {...props}
    />
  );

const getBodyRowClassNames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr")).map((row) => row.className);

describe("FastTableListed states", () => {
  it("shows only the loading row while an empty table is loading", () => {
    const { container } = renderListed({ isEmpty: true, isLoading: true });

    expect(getBodyRowClassNames(container)).toEqual(["loading-state-row"]);
  });

  it("shows the empty state once loading is finished", () => {
    const { container } = renderListed({ isEmpty: true, isLoading: false });

    expect(getBodyRowClassNames(container)).toEqual(["empty-state-row"]);
  });

  it("keeps the default loader and headers when options are not set", () => {
    const { container } = renderListed({ isEmpty: true, isLoading: true });

    expect(container.querySelector(".fast-table.fast-table-compact-loader")).toBeNull();
    expect(container.querySelector("table.fast-table-wrap-headers")).toBeNull();
  });

  it("applies compact loader and header wrapping when enabled", () => {
    const { container } = renderListed({
      isEmpty: true,
      isLoading: true,
      compactLoader: true,
      wrapHeaders: true,
    });

    expect(container.querySelector(".fast-table.fast-table-compact-loader")).not.toBeNull();
    expect(container.querySelector("table.fast-table-wrap-headers")).not.toBeNull();
  });
});
