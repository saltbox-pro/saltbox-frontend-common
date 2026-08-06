import type { AppError } from "../app-error";

import { ErrorState } from "./error-state";

type HttpErrorInlineProps = {
  error: AppError;
  onRetry?: () => void;
};

/** Компактное представление ошибки: блоки, виджеты, drawer-ы, тело таблицы. */
export const HttpErrorInline = ({ error, onRetry }: HttpErrorInlineProps) => (
  <ErrorState error={error} variant="block" onRetry={onRetry} />
);
