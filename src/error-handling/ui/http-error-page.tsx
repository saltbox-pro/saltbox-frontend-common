import type { AppError } from "../app-error";

import { ErrorState } from "./error-state";

type HttpErrorPageProps = {
  error: AppError;
  homePath?: string;
  onRetry?: () => void;
};

/**
 * Полностраничное представление ошибки. Отличается от inline только масштабом
 * и кнопкой «на главную» — разметка общая (ErrorState).
 */
export const HttpErrorPage = ({ error, homePath, onRetry }: HttpErrorPageProps) => (
  <ErrorState
    error={error}
    variant="page"
    onRetry={onRetry}
    onNavigateHome={homePath ? () => window.location.assign(homePath) : undefined}
  />
);
