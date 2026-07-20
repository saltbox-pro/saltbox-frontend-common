import { EditOutlined, DeleteOutlined, ExportOutlined } from "@ant-design/icons";
import type { Meta, StoryObj } from "@storybook/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Tag } from "antd";
import React from "react";

import { FastTableListed, type FastTableListedProps } from "./fast-table-listed";

// Mock данные
type MockUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "archived";
  lastLogin: string;
};

const mockUsers: MockUser[] = [
  {
    id: "user-001",
    name: "Иван Иванов",
    email: "ivan.ivanov@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-28 10:30",
  },
  {
    id: "user-002",
    name: "Мария Петрова",
    email: "maria.petrova@example.com",
    role: "User",
    status: "active",
    lastLogin: "2024-01-28 09:15",
  },
  {
    id: "user-003",
    name: "Алексей Сидоров",
    email: "alexey.sidorov@example.com",
    role: "Developer",
    status: "inactive",
    lastLogin: "2024-01-25 14:20",
  },
  {
    id: "user-004",
    name: "Елена Смирнова",
    email: "elena.smirnova@example.com",
    role: "Manager",
    status: "active",
    lastLogin: "2024-01-28 11:45",
  },
  {
    id: "user-005",
    name: "Дмитрий Кузнецов",
    email: "dmitry.kuznetsov@example.com",
    role: "User",
    status: "archived",
    lastLogin: "2024-01-10 08:00",
  },
];

const columnHelper = createColumnHelper<MockUser>();

function FastTableListedStory(props: FastTableListedProps<MockUser>) {
  return <FastTableListed<MockUser> {...props} />;
}

const meta = {
  title: "Components/FastTable/FastTableListed",
  component: FastTableListedStory,
  decorators: [
    (Story) => (
      <div style={{ height: "600px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
FastTableListed - таблица без пагинации для отображения списков данных.

## Новые возможности (SB-70):
- **Автоматические actions** через meta.showCopy и meta.actions
- **Клик по строке** через onRowClick
- **Ховер на ячейку** - иконки появляются при ховере на конкретную ячейку
- **Защита от конфликтов** - клики по иконкам не триггерят клик по строке
        `,
      },
    },
  },
  tags: ["autodocs"],
  args: {
    tableId: "story-fast-table-listed",
  },
} satisfies Meta<typeof FastTableListedStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовая таблица с примером данных
 */
export const Basic: Story = {
  args: {
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("role", {
        header: "Роль",
      }),
      columnHelper.accessor("status", {
        header: "Статус",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "active" ? "green" : status === "inactive" ? "orange" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story: "Базовая таблица с примером данных пользователей.",
      },
    },
  },
};

/**
 * Пустое состояние таблицы
 */
export const Empty: Story = {
  args: {
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
    ],
    data: [],
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story: "Пустая таблица без данных.",
      },
    },
  },
};

/**
 * С кнопками копирования (meta.showCopy)
 */
export const WithCopyActions: Story = {
  args: {
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("role", {
        header: "Роль",
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с кнопками копирования для колонок ID и Email. Иконки появляются при ховере на ячейку.",
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
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
          actions: [
            {
              icon: <ExportOutlined />,
              onClick: (value) => alert(`Открыть пользователя: ${value}`),
              title: "Открыть в новой вкладке",
            },
          ],
        },
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("status", {
        header: "Статус",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "active" ? "green" : status === "inactive" ? "orange" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story: "Таблица с пользовательскими actions (иконка навигации) для колонки ID.",
      },
    },
  },
};

/**
 * С несколькими actions в одной ячейке
 */
export const WithMultipleActions: Story = {
  args: {
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
          actions: [
            {
              icon: <ExportOutlined />,
              onClick: (value) => alert(`Открыть: ${value}`),
              title: "Открыть",
            },
            {
              icon: <EditOutlined />,
              onClick: (value, row) => alert(`Редактировать: ${row.name}`),
              title: "Редактировать",
            },
            {
              icon: <DeleteOutlined />,
              onClick: (value, row) => alert(`Удалить: ${row.name}`),
              title: "Удалить",
            },
          ],
        },
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("role", {
        header: "Роль",
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с несколькими actions (копирование + 3 пользовательских действия) в колонке ID.",
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
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("name", {
        header: "Имя",
        meta: {
          actions: [
            {
              icon: <EditOutlined />,
              onClick: (value) => alert(`Редактировать: ${value}`),
              title: "Редактировать",
              disabled: (value, row) => row.status === "archived",
            },
            {
              icon: <DeleteOutlined />,
              onClick: (value) => alert(`Удалить: ${value}`),
              title: "Удалить",
              visible: (value, row) => row.role !== "Admin",
            },
          ],
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("status", {
        header: "Статус",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "active" ? "green" : status === "inactive" ? "orange" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Таблица с условными actions: кнопка редактирования disabled для archived пользователей, кнопка удаления скрыта для Admin.",
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
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        meta: {
          showCopy: true,
        },
      }),
      columnHelper.accessor("name", {
        header: "Имя",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("status", {
        header: "Статус",
        cell: (data) => {
          const status = data.getValue();
          const color = status === "active" ? "green" : status === "inactive" ? "orange" : "red";
          return <Tag color={color}>{status}</Tag>;
        },
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
    onRowClick: (row) => alert(`Клик по строке: ${row.name} (${row.id})`),
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
 * С сортировкой колонок
 */
export const WithSorting: Story = {
  args: {
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (data) => <span style={{ color: "#1677ff" }}>{data.getValue()}</span>,
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        header: "Имя",
        enableSorting: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: true,
      }),
      columnHelper.accessor("lastLogin", {
        header: "Последний вход",
        enableSorting: true,
      }),
    ],
    data: mockUsers,
    getRowId: (row) => row.id,
  },
  parameters: {
    docs: {
      description: {
        story: "Таблица с возможностью сортировки по всем колонкам.",
      },
    },
  },
};
