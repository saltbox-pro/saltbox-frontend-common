import { ToastEventDetail, ToastSurface, ToastType, UiEvent } from "../../interfaces/ui-events";
import { publish, subscribe } from "../../utils/custom-events";

declare global {
  interface Window {
    /** Ставится ToastHost-ом base при маунте; общий флаг для всех бандлов. */
    __saltboxToastHostReady?: boolean;
  }
}

export type ToastInput = string | Omit<ToastEventDetail, "type">;

/**
 * Копия модуля (и буфер) — своя в каждом бандле микрофронтенда; это нормально:
 * буфер нужен только до маунта ToastHost-а, дальше все пишут в одно событие.
 */
let buffer: ToastEventDetail[] = [];
let subscribed = false;

const isHostReady = (): boolean =>
  typeof window !== "undefined" && Boolean(window.__saltboxToastHostReady);

function ensureSubscribed(): void {
  if (subscribed || typeof document === "undefined") return;
  subscribed = true;
  subscribe(UiEvent.ToastHostReady, () => {
    const pending = buffer;
    buffer = [];
    pending.forEach((detail) => publish(UiEvent.Toast, detail));
  });
}

function send(type: ToastType, input: ToastInput, surface?: ToastSurface): void {
  const base: ToastEventDetail =
    typeof input === "string" ? { type, title: input } : { type, ...input };
  const detail: ToastEventDetail = surface ? { ...base, surface } : base;

  if (isHostReady()) {
    publish(UiEvent.Toast, detail);
    return;
  }
  ensureSubscribed();
  buffer.push(detail);
}

/**
 * Фасад тостов: единственный путь показа эфемерных сообщений. Отрисовщик один на
 * продукт — ToastHost в base (единый стек, maxCount, длительности, replace по key).
 * Никаких локальных message.useMessage для ошибок действий.
 */
export const notify = {
  success: (input: ToastInput) => send("success", input),
  error: (input: ToastInput) => send("error", input),
  info: (input: ToastInput) => send("info", input),
  warning: (input: ToastInput) => send("warning", input),
  /** Лёгкие подтверждения по центру сверху. Title и опционально actions. */
  message: {
    success: (input: ToastInput) => send("success", input, "message"),
    error: (input: ToastInput) => send("error", input, "message"),
    info: (input: ToastInput) => send("info", input, "message"),
    warning: (input: ToastInput) => send("warning", input, "message"),
    loading: (input: ToastInput) => send("loading", input, "message"),
  },
};

/** Только для тестов: сброс модульного состояния. */
export function resetNotifyForTests(): void {
  buffer = [];
  subscribed = false;
}
