import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "antd";

export function createExpanderColumn<TData>(): ColumnDef<TData> {
  return {
    id: "expander",
    cell: ({ row }) => {
      if (!row.getCanExpand()) return null;

      return (
        <Button
          icon={row.getIsExpanded() ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
          size="small"
          type="link"
          onClick={row.getToggleExpandedHandler()}
        />
      );
    },
  };
}
