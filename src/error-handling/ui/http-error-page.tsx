import type { AppError } from "../app-error";

import { ErrorState } from "./error-state";

type HttpErrorPageProps = {
  error: AppError;
  /**
   * Фолбэк для кнопки «на главную»: полная перезагрузка по адресу. В микрофронтендовой
   * среде теряет состояние остальных приложений — предпочтительнее onNavigateHome.
   */
  homePath?: string;
  /** Навигация средствами приложения (useNavigate / single-spa navigateToUrl). */
  onNavigateHome?: () => void;
  onRetry?: () => void;
};

/**
 * Полностраничное представление ошибки. Отличается от inline только масштабом
 * и кнопкой «на главную» — разметка общая (ErrorState).
 */
export const HttpErrorPage = ({ error, homePath, onNavigateHome, onRetry }: HttpErrorPageProps) => (
  <ErrorState
    error={error}
    variant="page"
    onRetry={onRetry}
    onNavigateHome={
      onNavigateHome ?? (homePath ? () => window.location.assign(homePath) : undefined)
    }
  />
);
