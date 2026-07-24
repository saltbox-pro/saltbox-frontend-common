export type WebSocketMessage<T> = {
  message_tag: string;
  payload: T;
};

export type WebSocketServiceOptions = {
  bufferFlushIntervalMs?: number;
};

export class WebSocketService<T> {
  private ws: WebSocket | null;
  private accessToken: string | null;
  private messageBuffer: WebSocketMessage<T>[];
  private flushTimeout: number | null;
  private readonly bufferFlushIntervalMs: number;

  constructor(options: WebSocketServiceOptions = {}) {
    this.ws = null;
    this.accessToken = null;
    this.messageBuffer = [];
    this.flushTimeout = null;
    this.bufferFlushIntervalMs = options.bufferFlushIntervalMs ?? 2000;
  }

  sendAccessToken = (accessToken: string | null) => {
    this.accessToken = accessToken;
    if (this.isConnected() && this.accessToken) {
      this.ws.send(accessToken);
    }
  };

  isConnected = () => {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  };

  connect = (
    url: string,
    accessToken: string | null,
    events: { onMessage?: (update: Array<WebSocketMessage<T>>) => void; onOpen?: () => void }
  ) => {
    try {
      this.ws = new WebSocket(url);
      this.clearBuffer();

      this.ws.onopen = () => {
        this.sendAccessToken(accessToken);
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
        this.clearBuffer();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
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

  disconnect = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.clearBuffer();
    }
  };
}
