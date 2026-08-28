import { reaction, type IReactionDisposer } from "mobx";

import { WebSocketService } from "./websocket-service";

export type AuthStoreWithAccessToken = {
  user?: {
    access_token?: string;
  } | null;
};

export function bindWebSocketAccessTokenSync(authStore: AuthStoreWithAccessToken): () => void {
  let disposer: IReactionDisposer | undefined;

  disposer = reaction(
    () => authStore.user,
    (user) => {
      WebSocketService.syncAccessToken(user?.access_token ?? null);
    },
    { fireImmediately: true }
  );

  return () => {
    disposer?.();
    disposer = undefined;
  };
}
