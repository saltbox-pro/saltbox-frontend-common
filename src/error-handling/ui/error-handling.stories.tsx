import type { Meta, StoryObj } from "@storybook/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Card, Flex } from "antd";
import React from "react";

import { FastTablePaginated } from "../../components/fast-table/fast-table-paginated/fast-table-paginated";
import type { AppError, AppErrorKind } from "../app-error";
import type { LoadSource } from "../create-loader";

import { ErrorZone } from "./error-zone";
import { HttpErrorInline } from "./http-error-inline";
import { HttpErrorPage } from "./http-error-page";
import { MutationErrorAlert } from "./mutation-error-alert";

const ALL_KINDS: Array<{ kind: AppErrorKind; status: number }> = [
  { kind: "network", status: 0 },
  { kind: "unavailable", status: 503 },
  { kind: "server", status: 500 },
  { kind: "unauthorized", status: 401 },
  { kind: "forbidden", status: 403 },
  { kind: "not_found", status: 404 },
  { kind: "conflict", status: 409 },
  { kind: "validation", status: 422 },
  { kind: "generic", status: 400 },
];

const makeError = (kind: AppErrorKind, status: number, serverMessage?: string): AppError => ({
  kind,
  status,
  serverMessage,
  raw: undefined,
});

const makeSource = (
  error: AppError | null,
  { initial = true }: { initial?: boolean } = {}
): LoadSource => ({
  status: error ? "error" : "success",
  error,
  isLoading: false,
  isInitialLoad: initial,
  retry: () => alert("retry"),
  bind: () => undefined,
  unbind: () => undefined,
});

const meta: Meta = {
  title: "ErrorHandling/Ошибки",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

/** Полностраничное состояние (level="page") для каждого kind. */
export const PageAllKinds: Story = {
  render: () => (
    <Flex vertical>
      {ALL_KINDS.map(({ kind, status }) => (
        <div key={kind} style={{ height: 360, overflow: "hidden", borderBottom: "1px solid #eee" }}>
          <HttpErrorPage error={makeError(kind, status)} homePath="/" onRetry={() => undefined} />
        </div>
      ))}
    </Flex>
  ),
};

/** Компактное состояние (level="block") для каждого kind. */
export const InlineAllKinds: Story = {
  render: () => (
    <Flex wrap gap={16} style={{ padding: 24 }}>
      {ALL_KINDS.map(({ kind, status }) => (
        <Card key={kind} title={kind} style={{ width: 360 }}>
          <HttpErrorInline error={makeError(kind, status)} onRetry={() => undefined} />
        </Card>
      ))}
    </Flex>
  ),
};

/** Сообщение бекенда (serverMessage) замещает стандартный подзаголовок. */
export const ServerMessage: Story = {
  render: () => (
    <Card style={{ margin: 24, width: 480 }}>
      <HttpErrorInline
        error={makeError(
          "conflict",
          409,
          "Коллекция «Продакшн-серверы» уже содержит клиент с таким ID"
        )}
        onRetry={() => undefined}
      />
    </Card>
  ),
};

/**
 * Ошибка действия в модалке: персональный заголовок операции, под ним код с расшифровкой,
 * причина от бекенда и раскрывашка деталей.
 */
export const MutationError: Story = {
  render: () => (
    <Card style={{ margin: 24, width: 520 }}>
      <MutationErrorAlert
        error={{
          ...makeError("conflict", 409, "Задача с таким расписанием уже существует"),
          diagnostics: {
            url: "https://saltbox.local/api/v1/scheduler/tasks/42",
            status: 409,
            statusText: "Conflict",
            responseBody: '{"detail":"Задача с таким расписанием уже существует"}',
            timestamp: new Date().toISOString(),
          },
        }}
        fallback="Не удалось сохранить расписание"
        onClose={() => undefined}
      />
    </Card>
  ),
};

/** Вложенные зоны: ошибка блока не закрывает страницу. */
export const NestedZones: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <ErrorZone level="page" loaders={[makeSource(null)]}>
        <h2>Страница жива</h2>
        <Flex gap={16}>
          <Card title="Виджет со сломанной загрузкой" style={{ width: 380 }}>
            <ErrorZone level="block" loaders={[makeSource(makeError("server", 500))]}>
              <p>Этого контента не видно</p>
            </ErrorZone>
          </Card>
          <Card title="Здоровый виджет" style={{ width: 380 }}>
            <ErrorZone level="block" loaders={[makeSource(null)]}>
              <p>А этот контент живёт своей жизнью</p>
            </ErrorZone>
          </Card>
        </Flex>
      </ErrorZone>
    </div>
  ),
};

/** Refresh-ошибка: данные уже показаны, зона не блокирует — индикатор сверху. */
export const RefreshFailed: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <ErrorZone level="block" loaders={[makeSource(makeError("server", 500), { initial: false })]}>
        <Card title="Список задач (данные устарели, но видны)">
          <p>task-1 · выполнена</p>
          <p>task-2 · в работе</p>
        </Card>
      </ErrorZone>
    </div>
  ),
};

type MockRow = { id: string; name: string };
const tableColumnHelper = createColumnHelper<MockRow>();
const tableColumns = [
  tableColumnHelper.accessor("id", { header: "ID" }),
  tableColumnHelper.accessor("name", { header: "Название" }),
];

/** Упавшая загрузка списка: error-state в теле таблицы, шапка и структура живы. */
export const TableLoadError: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <FastTablePaginated<MockRow>
        tableId="story-error-table"
        columns={tableColumns}
        data={[]}
        total={0}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onLazyLoad={() => undefined}
        loader={makeSource(makeError("unavailable", 503))}
      />
    </div>
  ),
};

/** Ошибка обновления списка: данные видны, сверху refresh-баннер. */
export const TableRefreshError: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <FastTablePaginated<MockRow>
        tableId="story-refresh-table"
        columns={tableColumns}
        data={[
          { id: "1", name: "minion-01" },
          { id: "2", name: "minion-02" },
        ]}
        total={2}
        pagination={{ pageIndex: 0, pageSize: 10 }}
        onLazyLoad={() => undefined}
        loader={makeSource(makeError("server", 500), { initial: false })}
      />
    </div>
  ),
};

/**
 * Кейс «бекенд упал целиком»: N независимых зон, каждая со своим состоянием и Retry —
 * вместо одной глобальной нотификации. Эталон для обсуждения с дизайнером.
 */
export const TotalOutage: Story = {
  render: () => (
    <Flex wrap gap={16} style={{ padding: 24 }}>
      {["Клиенты", "Команды", "Задачи", "Планировщик"].map((widget) => (
        <Card key={widget} title={widget} style={{ width: 360 }}>
          <ErrorZone level="block" loaders={[makeSource(makeError("unavailable", 503))]}>
            <p>контент</p>
          </ErrorZone>
        </Card>
      ))}
    </Flex>
  ),
};
