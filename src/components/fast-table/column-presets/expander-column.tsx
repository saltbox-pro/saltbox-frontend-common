import { MinusSquareOutlined, PlusSquareOutlined } from "@ant-design/icons";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "antd";

export function createExpanderColumn<TData>(): ColumnDef<TData> {
  return {
    id: "expander",
    enableResizing: false,
    enableHiding: false,
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
    meta: { width: 49, minWidth: 49, maxWidth: 49 },
  };
}
