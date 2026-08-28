export type WebSocketMessage<T> = {
  message_tag: string;
  payload: T;
};

export type WebSocketServiceOptions = {
  bufferFlushIntervalMs?: number;
};

export class WebSocketService<T> {
  private static readonly activeInstances = new Set<WebSocketService<unknown>>();

  private ws: WebSocket | null;
  private accessToken: string | null;
  private onCloseHandler: (() => void) | null;
  private messageBuffer: WebSocketMessage<T>[];
  private flushTimeout: number | null;
  private readonly bufferFlushIntervalMs: number;

  static syncAccessToken(accessToken: string | null): void {
    if (accessToken === null) {
      for (const instance of [...WebSocketService.activeInstances]) {
        instance.disconnect({ notify: false });
      }
      return;
    }

    for (const instance of WebSocketService.activeInstances) {
      instance.sendAccessToken(accessToken);
    }
  }

  constructor(options: WebSocketServiceOptions = {}) {
    this.ws = null;
    this.accessToken = null;
    this.onCloseHandler = null;
    this.messageBuffer = [];
    this.flushTimeout = null;
    this.bufferFlushIntervalMs = options.bufferFlushIntervalMs ?? 2000;
  }

  sendAccessToken = (accessToken: string | null) => {
    this.accessToken = accessToken;
    if (this.isConnected() && this.accessToken) {
      this.ws.send(this.accessToken);
    }
  };

  isConnected = () => {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  };

  connect = (
    url: string,
    accessToken: string | null,
    events: {
      onMessage?: (update: Array<WebSocketMessage<T>>) => void;
      onOpen?: () => void;
      onClose?: () => void;
    }
  ) => {
    try {
      this.accessToken = accessToken;
      this.closeActiveSocket();
      this.onCloseHandler = events?.onClose ?? null;
      WebSocketService.activeInstances.add(this as WebSocketService<unknown>);

      this.ws = new WebSocket(url);
      this.clearBuffer();

      this.ws.onopen = () => {
        this.sendAccessToken(this.accessToken);
        if (events?.onOpen) {
          events.onOpen();
        }
      };

      this.ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsedData = JSON.parse(event.data) as WebSocketMessage<T>;
          this.messageBuffer.push(parsedData);
          if (!this.flushTimeout) {
            this.flushBuffer(events?.onMessage || (() => {}));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        WebSocketService.activeInstances.delete(this as WebSocketService<unknown>);
        this.ws = null;
        this.clearBuffer();
        const onClose = this.onCloseHandler;
        this.onCloseHandler = null;
        onClose?.();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      WebSocketService.activeInstances.delete(this as WebSocketService<unknown>);
      console.error("Failed to connect WebSocket:", error);
    }
  };

  private closeActiveSocket = () => {
    if (!this.ws) {
      return;
    }

    const socket = this.ws;
    this.ws = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  };

  private flushBuffer = (onMessage: (update: Array<WebSocketMessage<T>>) => void) => {
    if (this.messageBuffer.length === 0) {
      return;
    }

    if (this.bufferFlushIntervalMs <= 0) {
      onMessage([...this.messageBuffer]);
      this.messageBuffer = [];
      return;
    }

    this.flushTimeout = window.setTimeout(() => {
      onMessage([...this.messageBuffer]);
      this.clearBuffer();
    }, this.bufferFlushIntervalMs);
  };

  private clearBuffer = () => {
    this.messageBuffer = [];
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  };

  disconnect = (options?: { notify?: boolean }) => {
    WebSocketService.activeInstances.delete(this as WebSocketService<unknown>);
    const onClose = this.onCloseHandler;
    this.onCloseHandler = null;
    this.closeActiveSocket();
    this.clearBuffer();
    if (options?.notify !== false) {
      onClose?.();
    }
  };
}
