import { Button, Space } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import type { ToastAction, ToastEventDetail, ToastType } from "../interfaces/ui-events";

import { formatErrorCode } from "./ui/resolve-http-error-presentation";
import { ToastContent } from "./ui/toast-content";

/** Политика длительностей — навязывается всем приложениям, в этом смысл единого host-а. */
const DURATION_SEC: Record<ToastType, number> = {
  error: 6,
  warning: 6,
  success: 3,
  info: 3,
};

/** Ключ для тостов без своего key: нужен, чтобы разворачивание деталей нашло свой тост. */
let autoKeySeq = 0;

export type ShowToast = (detail: ToastEventDetail) => void;

export interface ToastRendererOptions {
  /** Переход по href из действия тоста; в продукте — single-spa navigateToUrl. */
  onNavigate?: (href: string) => void;
}

function renderToastDescription(detail: ToastEventDetail) {
  return detail.description?.includes("\n") ? (
    <span style={{ whiteSpace: "pre-line" }}>{detail.description}</span>
  ) : (
    detail.description
  );
}

const ToastActionButtons = ({
  actions,
  onNavigate,
}: {
  actions: ToastAction[];
  onNavigate?: (href: string) => void;
}) => (
  <Space>
    {actions.map((action) => (
      <Button
        key={`${action.label}:${action.href ?? ""}`}
        size="small"
        onClick={() => (action.href ? onNavigate?.(action.href) : action.onClick?.())}
      >
        {action.label}
      </Button>
    ))}
  </Space>
);

/**
 * Отрисовка одного тоста поверх antd-инстансов. Живёт в общей библиотеке, чтобы
 * ToastHost продукта (base) и упрощённый host Storybook показывали сообщения одинаково:
 * код с расшифровкой, раскрывашка деталей, копирование, длительности, replace по key.
 */
export function useToastRenderer(
  api: NotificationInstance,
  messageApi: MessageInstance,
  options: ToastRendererOptions = {}
): ShowToast {
  const { t } = useTranslation("common");
  const { onNavigate } = options;

  const render = useCallback(
    (detail: ToastEventDetail, key: string, expanded: boolean) => {
      // лёгкая поверхность: короткая строка по центру сверху (подтверждения копирования)
      if (detail.surface === "message") {
        messageApi.open({
          type: detail.type,
          key,
          content: detail.title,
          duration: detail.durationSec ?? DURATION_SEC[detail.type],
        });
        return;
      }

      const codeLine = detail.errorCode
        ? formatErrorCode(detail.errorCode.status, detail.errorCode.kind, t)
        : undefined;
      const hasRichContent = Boolean(codeLine || detail.debugText);
      const description = hasRichContent ? (
        <ToastContent
          codeLine={codeLine}
          description={detail.description}
          debugText={detail.debugText}
          expanded={expanded}
          // разворачивая детали, закрепляем тост — иначе он исчезнет во время чтения
          onExpand={() => render(detail, key, true)}
          onCollapse={() => render(detail, key, false)}
        />
      ) : (
        renderToastDescription(detail)
      );

      api.open({
        type: detail.type,
        key,
        message: detail.title,
        description,
        duration: expanded ? 0 : (detail.durationSec ?? DURATION_SEC[detail.type]),
        btn: detail.actions?.length ? (
          <ToastActionButtons actions={detail.actions} onNavigate={onNavigate} />
        ) : undefined,
      });
    },
    [api, messageApi, onNavigate, t]
  );

  return useCallback(
    (detail: ToastEventDetail) => render(detail, detail.key ?? `toast-${++autoKeySeq}`, false),
    [render]
  );
}
