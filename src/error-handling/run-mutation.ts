import { AppError, buildErrorDebugText, normalizeApiError } from "./app-error";
import { applyValidationErrors, FormFieldsSetter } from "./apply-validation-errors";
import { notify } from "./notify";

export type MutationResult<T> = { ok: true; data: T } | { ok: false; error: AppError };

export interface RunMutationOptions<T> {
  run: () => Promise<T>;
  /** Уже переведённый заголовок ошибки операции («Не удалось удалить клиент») */
  errorMessage: string;
  /** Success-тост; без него успех молчалив */
  successMessage?: string;
  /** antd-форма: 422 уходит в поля через applyValidationErrors, без тоста */
  form?: FormFieldsSetter;
  /**
   * Ошибка отдаётся вызывающему (состояние модалки → MutationErrorAlert),
   * тост не показывается. Семантика keepOpenOnError.
   */
  onError?: (error: AppError) => void;
  /** Перезагрузка данных после успеха (обычно loader.retry) */
  reload?: () => void;
}

/**
 * Стандартная операция «действие»: ошибка — эфемерный показ, состоянием не становится.
 * Политика зашита: нормализация (claim гасит глобальную нотификацию 5xx) →
 * 422 в поля формы → onError в модалку → иначе тост с serverMessage второй строкой.
 * Никогда не бросает.
 */
export async function runMutation<T>(options: RunMutationOptions<T>): Promise<MutationResult<T>> {
  try {
    const data = await options.run();
    if (options.successMessage) notify.success(options.successMessage);
    options.reload?.();
    return { ok: true, data };
  } catch (e) {
    const error = await normalizeApiError(e);

    if (error.kind === "validation" && options.form && applyValidationErrors(options.form, error)) {
      return { ok: false, error };
    }
    if (options.onError) {
      options.onError(error);
      return { ok: false, error };
    }
    notify.error({
      title: options.errorMessage,
      description: error.serverMessage,
      // транспортная диагностика доступна прямо из тоста, отдельного канала не нужно
      debugText: error.diagnostics ? buildErrorDebugText(error) : undefined,
    });
    return { ok: false, error };
  }
}
