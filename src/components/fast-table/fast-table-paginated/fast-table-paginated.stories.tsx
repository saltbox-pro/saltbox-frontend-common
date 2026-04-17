import { DeleteOutlined, ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { createColumnHelper, type PaginationState, type SortingState } from "@tanstack/react-table";
import { Tag, Checkbox } from "antd";
import React, { useState } from "react";

import { FastTablePaginated, type FastTablePaginatedProps } from "./fast-table-paginated";

// Mock данные для job'ов
type MockJob = {
  jid: string;
  function: string;
  target: string;
  status: "running" | "completed" | "failed";
  startTime: string;
  user: string;
};

const generateMockJobs = (count: number): MockJob[] => {
  const functions = ["state.apply", "cmd.run", "pkg.install", "service.restart", "grains.items"];
  const statuses: Array<"running" | "completed" | "failed"> = ["running", "completed", "failed"];

  return Array.from({ length: count }, (_, i) => ({
    jid: `20240128${String(i + 1).padStart(6, "0")}`,
    function: functions[i % functions.length],
    target: `minion-${(i % 20) + 1}`,
    status: statuses[i % 3],
    startTime: `2024-01-28 ${String(Math.floor(i / 4) % 24).padStart(2, "0")}:${String(
      (i * 15) % 60
    ).padStart(2, "0")}`,
    user: i % 3 === 0 ? "admin" : i % 3 === 1 ? "operator" : "developer",
  }));
};

const smallDataset = generateMockJobs(20);
const mediumDataset = generateMockJobs(100);
const largeDataset = generateMockJobs(1000);

const columnHelper = createColumnHelper<MockJob>();

const defaultPagination: PaginationState = { pageIndex: 0, pageSize: 20 };
const defaultSorting: SortingState = [];
const noopLazyLoad = (_pagination: PaginationState, _sorting: SortingState) => undefined;

function FastTablePaginatedStory(props: FastTablePaginatedProps<MockJob>) {
  return <FastTablePaginated<MockJob> {...props} />;
}

const meta = {
  title: "Components/FastTable/FastTablePaginated",
  component: FastTablePaginatedStory,
  decorators: [
    (Story) => (
      <div style={{ height: "700px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
FastTablePaginated - таблица с пагинацией и виртуальной прокруткой для больших объёмов данных.

## Новые возможности (SB-70):
- **Автоматические actions** через meta.showCopy и meta.actions
- **Клик по строке** через onRowClick
- **Ховер на ячейку** - иконки появляются при ховере на конкретную ячейку
- **Защита от конфликтов** - клики по иконкам не триггерят клик по строке
- **Виртуальная прокрутка** для больших datasets (useVirtualScroll)
        `,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FastTablePaginatedStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовая таблица с пагинацией
 */
export const Basic: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("startTime", {
        header: "Start Time",
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story: "Базовая таблица с пагинацией (20 записей).",
      },
    },
  },
};

/**
 * С виртуальной прокруткой (большой dataset)
 */
export const WithVirtualScroll: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("user", {
        header: "User",
      }),
    ],
    data: mediumDataset,
    getRowId: (row) => row.jid,
    useVirtualScroll: true,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story: "Таблица с виртуальной прокруткой для эффективного отображения 100 записей.",
      },
    },
  },
};

/**
 * С кнопками копирования
 */
export const WithCopyActions: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с кнопками копирования для JID и Target. Иконки появляются при ховере на ячейку.",
      },
    },
  },
};

/**
 * С пользовательскими actions
 */
export const WithCustomActions: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
          actions: [
            {
              icon: <ExportOutlined />,
              onClick: (value) => alert(`Открыть job: ${value}`),
              title: "Открыть в новой вкладке",
            },
            {
              icon: <ReloadOutlined />,
              onClick: (value) => alert(`Перезапустить job: ${value}`),
              title: "Перезапустить",
            },
          ],
        },
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story: "Таблица с пользовательскими actions (навигация и перезапуск) для колонки JID.",
      },
    },
  },
};

/**
 * С условными actions (visible/disabled)
 */
export const WithConditionalActions: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
          actions: [
            {
              icon: <ReloadOutlined />,
              onClick: (value) => alert(`Перезапустить: ${value}`),
              title: "Перезапустить",
              disabled: (value, row) => row.status === "running",
            },
            {
              icon: <DeleteOutlined />,
              onClick: (value) => alert(`Удалить: ${value}`),
              title: "Удалить",
              visible: (value, row) => row.status === "failed",
            },
          ],
        },
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("user", {
        header: "User",
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с условными actions: перезапуск disabled для running job'ов, удаление видно только для failed.",
      },
    },
  },
};

/**
 * С кликом по строке
 */
export const WithRowClick: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    onRowClick: (row) => alert(`Открыть детали job: ${row.jid}`),
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с обработчиком клика по строке. Клик по кнопке копирования не триггерит клик по строке.",
      },
    },
  },
};

/**
 * С сортировкой
 */
export const WithSorting: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        enableSorting: true,
      }),
      columnHelper.accessor("function", {
        header: "Function",
        enableSorting: true,
      }),
      columnHelper.accessor("target", {
        header: "Target",
        enableSorting: true,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
        enableSorting: true,
      }),
      columnHelper.accessor("startTime", {
        header: "Start Time",
        enableSorting: true,
      }),
    ],
    data: smallDataset,
    getRowId: (row) => row.jid,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story: "Таблица с возможностью сортировки по всем колонкам.",
      },
    },
  },
};

/**
 * Большой dataset (тест производительности)
 */
export const LargeDataset: Story = {
  args: {
    columns: [
      columnHelper.accessor("jid", {
        header: "JID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("function", {
        header: "Function",
      }),
      columnHelper.accessor("target", {
        header: "Target",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
      columnHelper.accessor("user", {
        header: "User",
      }),
    ],
    data: largeDataset,
    getRowId: (row) => row.jid,
    useVirtualScroll: true,
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с 1000 записей и виртуальной прокруткой для тестирования производительности.",
      },
    },
  },
};

/**
 * С выбором строк (checkboxes)
 */
const WithRowSelectionComponent = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (jid: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(jid)) {
      newSet.delete(jid);
    } else {
      newSet.add(jid);
    }
    setSelectedRows(newSet);
  };

  const toggleAll = () => {
    if (selectedRows.size === smallDataset.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(smallDataset.map((row) => row.jid)));
    }
  };

  const columns = [
    columnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={selectedRows.size === smallDataset.length}
          indeterminate={selectedRows.size > 0 && selectedRows.size < smallDataset.length}
          onChange={toggleAll}
        />
      ),
      cell: (info) => (
        <Checkbox
          checked={selectedRows.has(info.row.original.jid)}
          onChange={() => toggleRow(info.row.original.jid)}
        />
      ),
    }),
    columnHelper.accessor("jid", {
      header: "JID",
      cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
    }),
    columnHelper.accessor("function", {
      header: "Function",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (data) => {
        const status = data.getValue();
        const color = status === "completed" ? "green" : status === "running" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    }),
  ];

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        Выбрано: {selectedRows.size} из {smallDataset.length}
      </div>
      <FastTablePaginated
        columns={columns}
        data={smallDataset}
        getRowId={(row) => row.jid}
        pagination={defaultPagination}
        sorting={defaultSorting}
        onLazyLoad={noopLazyLoad}
      />
    </div>
  );
};

export const WithRowSelection: Story = {
  args: {
    columns: [],
    data: [],
    pagination: defaultPagination,
    sorting: defaultSorting,
    onLazyLoad: noopLazyLoad,
  },
  render: () => <WithRowSelectionComponent />,
  parameters: {
    docs: {
      description: {
        story: "Таблица с возможностью выбора строк через checkboxes.",
      },
    },
  },
};
