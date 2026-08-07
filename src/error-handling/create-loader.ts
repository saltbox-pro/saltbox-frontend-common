import { computed, makeObservable, observable, runInAction } from "mobx";

import { UiEvent } from "../interfaces/ui-events";
import { publish } from "../utils/custom-events";

import { AppError, buildErrorDebugText, isAbortError, normalizeApiError } from "./app-error";

export type LoadStatus = "idle" | "loading" | "success" | "error";

/**
 * Контракт для потребителей (ErrorZone, fast-table): наблюдаемое состояние загрузки
 * + повтор + учёт привязки к отрисовщику.
 */
export interface LoadSource {
  readonly status: LoadStatus;
  readonly error: AppError | null;
  readonly isLoading: boolean;
  /** true, пока не было ни одного успеха: ошибка блокирует зону; после успеха — refresh-режим */
  readonly isInitialLoad: boolean;
  retry(): void;
  /** Зона/таблица регистрируют себя как отрисовщика; без привязок ошибка уходит в страховочную сетку */
  bind(): void;
  unbind(): void;
}

/** Ошибка загрузки без привязанного отрисовщика — детали для страховочной сетки в base. */
export interface UnhandledLoadErrorEventDetail {
  status: number;
  kind: AppError["kind"];
  serverMessage?: string;
  /** Готовый текст диагностики: сетка показывает ту же кнопку «скопировать детали», что и тосты */
  debugText?: string;
  raw: unknown;
}

interface LoaderOptions<Args extends unknown[], T> {
  /** Может вернуть undefined, если API-клиент ещё не инициализирован (нет токена/env). */
  run: (...args: Args) => Promise<T> | undefined;
  /** Вызывается внутри mobx-action — runInAction не нужен. */
  onSuccess?: (data: T, ...args: Args) => void;
}

export class Loader<Args extends unknown[], T> implements LoadSource {
  status: LoadStatus = "idle";
  error: AppError | null = null;

  private seq = 0;
  private lastArgs: Args | null = null;
  private hasSucceeded = false;
  private bindings = 0;

  constructor(private readonly options: LoaderOptions<Args, T>) {
    makeObservable(this, {
      status: observable,
      error: observable.ref,
      isLoading: computed,
    });
  }

  get isLoading(): boolean {
    return this.status === "loading";
  }

  get isInitialLoad(): boolean {
    return !this.hasSucceeded;
  }

  run = async (...args: Args): Promise<void> => {
    const current = ++this.seq;
    this.lastArgs = args;
    runInAction(() => {
      this.status = "loading";
      this.error = null;
    });

    let data: T;
    try {
      const request = this.options.run(...args);
      if (!request) {
        this.settle(current, this.hasSucceeded ? "success" : "idle");
        return;
      }
      data = await request;
    } catch (e) {
      if (current !== this.seq) return;
      if (isAbortError(e)) {
        this.settle(current, this.hasSucceeded ? "success" : "idle");
        return;
      }
      const appError = await normalizeApiError(e);
      if (current !== this.seq) return;
      runInAction(() => {
        this.status = "error";
        this.error = appError;
      });
      this.reportIfUnbound(current, appError);
      return;
    }

    if (current !== this.seq) return; // устаревший запрос — пришёл более новый

    // onSuccess вне try: исключение в маппинге ответа — баг приложения, а не ошибка
    // загрузки. Состояние успеха уже проставлено, ошибка всплывает наружу как есть
    // и не превращается в AppError с фиктивным status 0.
    runInAction(() => {
      this.hasSucceeded = true;
      this.status = "success";
      this.options.onSuccess?.(data, ...args);
    });
  };

  retry = (): void => {
    if (this.lastArgs) {
      this.run(...this.lastArgs).catch(() => undefined);
    }
  };

  bind = (): void => {
    this.bindings += 1;
  };

  unbind = (): void => {
    this.bindings -= 1;
  };

  private settle(current: number, status: LoadStatus): void {
    runInAction(() => {
      if (current === this.seq) this.status = status;
    });
  }

  /**
   * setTimeout 0 — зазор для загрузок, стартующих до маунта зоны (конструктор стора,
   * init микрофронтенда); в обычном потоке привязка появляется задолго до ответа сети.
   */
  private reportIfUnbound(current: number, appError: AppError): void {
    setTimeout(() => {
      if (current !== this.seq || this.bindings > 0 || this.status !== "error") return;
      publish<UnhandledLoadErrorEventDetail>(UiEvent.UnhandledLoadError, {
        status: appError.status,
        kind: appError.kind,
        serverMessage: appError.serverMessage,
        debugText: appError.diagnostics ? buildErrorDebugText(appError) : undefined,
        raw: appError.raw,
      });
      if (process.env.NODE_ENV !== "production") {
        console.warn("[error-handling] Ошибка загрузки без ErrorZone/таблицы:", appError);
      }
    }, 0);
  }
}

export function createLoader<Args extends unknown[], T>(
  options: LoaderOptions<Args, T>
): Loader<Args, T> {
  return new Loader(options);
}

interface KeyedLoaderOptions<K, Args extends unknown[], T> {
  run: (key: K, ...args: Args) => Promise<T> | undefined;
  onSuccess?: (data: T, key: K, ...args: Args) => void;
}

/** Заглушка для ключей, по которым загрузка ещё не запускалась. */
const IDLE_SOURCE: LoadSource = Object.freeze({
  status: "idle" as const,
  error: null,
  isLoading: false,
  isInitialLoad: true,
  retry: () => undefined,
  bind: () => undefined,
  unbind: () => undefined,
});

/**
 * Параметризованные загрузки «по ключу» (элемент списка, вкладка): у каждого ключа —
 * своё независимое состояние. Заменяет ручные map «id → error/status» в сторах.
 */
export class KeyedLoader<K, Args extends unknown[], T> {
  private loaders = observable.map<K, Loader<Args, T>>([], { deep: false });

  constructor(private readonly options: KeyedLoaderOptions<K, Args, T>) {}

  state(key: K): LoadSource {
    return this.loaders.get(key) ?? IDLE_SOURCE;
  }

  run = (key: K, ...args: Args): Promise<void> => {
    let loader = this.loaders.get(key);
    if (!loader) {
      loader = new Loader<Args, T>({
        run: (...loaderArgs) => this.options.run(key, ...loaderArgs),
        onSuccess: (data, ...loaderArgs) => this.options.onSuccess?.(data, key, ...loaderArgs),
      });
      runInAction(() => {
        this.loaders.set(key, loader as Loader<Args, T>);
      });
    }
    return loader.run(...args);
  };
}

export function createKeyedLoader<K, Args extends unknown[], T>(
  options: KeyedLoaderOptions<K, Args, T>
): KeyedLoader<K, Args, T> {
  return new KeyedLoader(options);
}
