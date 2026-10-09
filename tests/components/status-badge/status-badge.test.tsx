// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge } from "../../../src/components/status-badge";

afterEach(cleanup);

describe("StatusBadge", () => {
  it("renders label, tone and default size", () => {
    render(<StatusBadge tone="success">Finished</StatusBadge>);

    const badge = screen.getByText("Finished").parentElement;

    expect(badge?.getAttribute("data-tone")).toBe("success");
    expect(badge?.getAttribute("data-size")).toBe("default");
  });

  it("renders prominent size and icon", () => {
    render(
      <StatusBadge tone="active" size="prominent" icon={<span data-testid="status-icon" />}>
        Running
      </StatusBadge>
    );

    const badge = screen.getByText("Running").parentElement;

    expect(badge?.getAttribute("data-size")).toBe("prominent");
    expect(screen.getByTestId("status-icon")).toBeTruthy();
  });
});
