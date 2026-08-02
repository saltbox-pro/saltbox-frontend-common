/**
 * @deprecated Совместимость на время миграции.
 *
 * Глобальный слой серверных ошибок удалён: все ошибки показывают примитивы
 * error-handling (createLoader → ErrorZone/таблица, runMutation → тост).
 * Эти функции остаются, чтобы немигрированный код продолжал компилироваться,
 * и специально ведут себя как «глобального показа нет»: guard возвращает false,
 * то есть старый catch-блок снова показывает свою локальную ошибку.
 *
 * Удаляется вместе с последним старым catch-блоком.
 */

/** @deprecated Всегда false: глобального показа ошибок больше нет. */
export function isGlobalServerError(_error: unknown): boolean {
  return false;
}

/** @deprecated No-op: маркер глобальной ошибки больше не используется. */
export function markGlobalServerError<E extends object>(error: E): E {
  return error;
}
