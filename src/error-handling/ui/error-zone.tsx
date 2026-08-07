import { Alert, Button } from "antd";
import { observer } from "mobx-react";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { AppErrorKind } from "../app-error";
import type { LoadSource } from "../create-loader";

import { HttpErrorInline } from "./http-error-inline";
import { HttpErrorPage } from "./http-error-page";

/** Порядок серьёзности при нескольких ошибках в одной зоне. */
const KIND_SEVERITY: AppErrorKind[] = [
  "network",
  "unavailable",
  "server",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "validation",
  "generic",
];

export interface ErrorZoneProps {
  /** page — полностраничный Result + «на главную»; block — компактный блок для виджетов/drawer-ов. */
  level?: "page" | "block";
  /**
   * Набор лоадеров зоны. Длина массива должна быть постоянной всё время жизни зоны:
   * элементы используются как зависимости эффекта bind/unbind, и React падает,
   * если их количество меняется между рендерами. Нужен условный набор — монтируйте
   * отдельную зону вокруг условной части дерева.
   */
  loaders: readonly LoadSource[];
  /** Только для level="page": фолбэк-адрес кнопки «на главную» (полная перезагрузка). */
  homePath?: string;
  /** Только для level="page": навигация средствами приложения, без перезагрузки. */
  onNavigateHome?: () => void;
  /**
   * Содержимое остаётся осмысленным и без ответа бекенда (например, часть данных
   * рассчитана на клиенте): ошибка всегда показывается баннером сверху, зона не закрывается.
   */
  keepContentOnError?: boolean;
  children: ReactNode;
}

/**
 * Зона блокирующих ошибок загрузки. Уровень отрисовки задаётся местом зоны в дереве:
 * ошибка привязанного лоадера закрывает ровно это поддерево.
 *
 * - Ошибка первой загрузки (isInitialLoad) — контент замещается error-состоянием.
 * - Ошибка обновления при уже показанных данных — контент остаётся, сверху индикатор
 *   «не удалось обновить».
 * - keepContentOnError — контент не замещается никогда, ошибка только баннером.
 * - bind/unbind сообщают лоадеру, что отрисовщик есть, — иначе ошибка уйдёт
 *   в страховочную сетку base (UiEvent.UnhandledLoadError).
 */
export const ErrorZone = observer(
  ({
    level = "block",
    loaders,
    homePath,
    onNavigateHome,
    keepContentOnError = false,
    children,
  }: ErrorZoneProps) => {
    const { t } = useTranslation("common");

    useEffect(() => {
      loaders.forEach((loader) => loader.bind());
      return () => loaders.forEach((loader) => loader.unbind());
      // Элементы массива — и есть зависимости: привязка живёт, пока живут лоадеры.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, loaders as unknown[]);

    const failed = loaders.filter((loader) => loader.error);
    if (!failed.length) return <>{children}</>;

    const retryFailed = () => failed.forEach((loader) => loader.retry());
    const blocking = keepContentOnError ? [] : failed.filter((loader) => loader.isInitialLoad);

    if (!blocking.length) {
      // данные на экране валидны, зону не закрываем: либо это ошибка обновления,
      // либо контент не зависит от упавшей загрузки (keepContentOnError)
      const hasInitialFailure = failed.some((loader) => loader.isInitialLoad);
      return (
        <>
          <Alert
            type="warning"
            showIcon
            banner
            message={t(hasInitialFailure ? "errors.partial-load-failed" : "errors.refresh-failed")}
            action={
              <Button size="small" onClick={retryFailed}>
                {t("errors.page.retry")}
              </Button>
            }
          />
          {children}
        </>
      );
    }

    const worst = blocking.reduce((a, b) =>
      KIND_SEVERITY.indexOf(a.error!.kind) <= KIND_SEVERITY.indexOf(b.error!.kind) ? a : b
    );

    if (level === "page") {
      return (
        <HttpErrorPage
          error={worst.error!}
          homePath={homePath}
          onNavigateHome={onNavigateHome}
          onRetry={retryFailed}
        />
      );
    }
    return <HttpErrorInline error={worst.error!} onRetry={retryFailed} />;
  }
);
