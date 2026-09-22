import { notify } from "../notifications/model/notify";

import { AppError, isAbortError, normalizeApiError } from "./app-error";
import { applyValidationErrors, FormFieldsSetter } from "./apply-validation-errors";
import { notifyAppError } from "./notify-app-error";

export type MutationResult<T> = { ok: true; data: T } | { ok: false; error: AppError };

interface RunMutationBaseOptions<T> {
  run: () => Promise<T>;
  /** Success-тост; без него успех молчалив */
  successMessage?: string;
  /** antd-форма: 422 уходит в поля через applyValidationErrors, без тоста */
  form?: FormFieldsSetter;
  /** Перезагрузка данных после успеха (обычно loader.retry) */
  reload?: () => void;
}

interface RunMutationToastOptions<T> extends RunMutationBaseOptions<T> {
  /** Уже переведённый заголовок ошибки операции («Не удалось удалить клиент») */
  errorMessage: string;
  onError?: undefined;
}

interface RunMutationHandledOptions<T> extends RunMutationBaseOptions<T> {
  /** Показывать ошибку берётся вызывающий — заголовок тоста не нужен */
  errorMessage?: string;
  /**
   * Ошибка отдаётся вызывающему (состояние модалки → MutationErrorAlert),
   * тост не показывается. Семантика keepOpenOnError.
   */
  onError: (error: AppError) => void;
}

/** errorMessage обязателен ровно тогда, когда ошибку показывает тост (нет onError). */
export type RunMutationOptions<T> = RunMutationToastOptions<T> | RunMutationHandledOptions<T>;

/**
 * Стандартная операция «действие»: ошибка — эфемерный показ, состоянием не становится.
 * Политика зашита: нормализация → отмена молча → 422 в поля формы → onError в модалку →
 * иначе тост с serverMessage второй строкой. Никогда не бросает.
 */
export async function runMutation<T>(options: RunMutationOptions<T>): Promise<MutationResult<T>> {
  try {
    const data = await options.run();
    if (options.successMessage) notify.success(options.successMessage);
    options.reload?.();
    return { ok: true, data };
  } catch (e) {
    const error = await normalizeApiError(e);

    // отмена — не ошибка: ни тоста, ни полей формы, ни onError (симметрично Loader.run)
    if (isAbortError(e)) {
      return { ok: false, error };
    }

    if (error.kind === "validation" && options.form && applyValidationErrors(options.form, error)) {
      return { ok: false, error };
    }
    if (options.onError) {
      options.onError(error);
      return { ok: false, error };
    }
    notifyAppError(error, options.errorMessage);
    return { ok: false, error };
  }
}
