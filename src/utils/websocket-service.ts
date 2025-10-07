export class WebSocketService<T> {
  private ws: WebSocket | null;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private accessToken: string | null;
  private messageBuffer: T[];
  private flushTimeout: number | null;

  readonly FLUSH_INTERVAL_MS = 2000;

  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.accessToken = null;
    this.messageBuffer = [];
  }

  sendAccessToken = (accessToken: string | null) => {
    this.accessToken = accessToken;
    if (this.isConnected() && this.accessToken) {
      this.ws.send(accessToken);
    }
  }

  isConnected = () => {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  connect = (url: string, accessToken: string | null, onMessage: (update: Array<T>) => void) => {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.sendAccessToken(accessToken);
      };

      this.ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const parsedData = JSON.parse(event.data) as T;
          this.messageBuffer.push(parsedData);
          if (!this.flushTimeout) {
            this.flushBuffer(onMessage);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.handleReconnect(url, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private flushBuffer = (onMessage: (update: Array<T>) => void) => {
    if (this.messageBuffer.length > 0) {
      this.flushTimeout = setTimeout(() => {
        onMessage([...this.messageBuffer]);
        this.messageBuffer = [];
        this.flushTimeout = null;
      }, this.FLUSH_INTERVAL_MS);
    }
  }

  private handleReconnect = (url: string, onMessage: (update: Array<T>) => void) => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(url, this.accessToken, onMessage);
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect = () => {
    if (this.ws) {
      console.log('WebSocket closed');
      this.ws.close();
      this.ws = null;
    }
  }
}
