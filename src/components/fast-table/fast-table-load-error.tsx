import { Alert, Button, Empty } from "antd";
import { observer } from "mobx-react";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { LoadSource } from "../../error-handling/create-loader";
import { HttpErrorInline } from "../../error-handling/ui/http-error-inline";

/**
 * Fallback тела таблицы при нуле строк: error-state лоадера вместо Empty,
 * если первая загрузка упала. Observer — таблица остаётся нереактивной.
 */
export const FastTableBodyFallback = observer(
  ({
    loader,
    colSpan,
    emptyDescription,
  }: {
    loader: LoadSource;
    colSpan: number;
    emptyDescription: ReactNode;
  }) => {
    if (loader.error && loader.isInitialLoad) {
      return (
        <tr className="empty-state-row">
          <td colSpan={colSpan}>
            <HttpErrorInline error={loader.error} onRetry={loader.retry} />
          </td>
        </tr>
      );
    }
    return (
      <tr className="empty-state-row">
        <td colSpan={colSpan}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
        </td>
      </tr>
    );
  }
);

/** Баннер над таблицей: ошибка обновления при уже показанных данных. */
export const FastTableRefreshAlert = observer(({ loader }: { loader?: LoadSource }) => {
  const { t } = useTranslation("common");
  if (!loader?.error || loader.isInitialLoad) return null;
  return (
    <Alert
      type="warning"
      showIcon
      banner
      message={t("errors.refresh-failed")}
      action={
        <Button size="small" onClick={loader.retry}>
          {t("errors.page.retry")}
        </Button>
      }
    />
  );
});

/** Регистрация таблицы как отрисовщика ошибок лоадера (страховочная сетка). */
export function useLoaderBinding(loader?: LoadSource): void {
  useEffect(() => {
    if (!loader) return undefined;
    loader.bind();
    return () => loader.unbind();
  }, [loader]);
}
