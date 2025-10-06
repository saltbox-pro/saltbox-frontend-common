import { PluginsStore } from "saltbox-common/interfaces/plugins-store";

export class AppStore {
  authStore: any;
  pluginsStore: PluginsStoreWrapper;

  constructor() {
    this.authStore = null;
    this.pluginsStore = null;
  }

  init(authStore: any, pluginsStore: PluginsStore) {
    this.authStore = authStore;
    this.pluginsStore = new PluginsStoreWrapper(pluginsStore);
  }
}

class PluginsStoreWrapper {
  private pluginsStore: PluginsStore;

  constructor(pluginsStore: PluginsStore) {
    this.pluginsStore = pluginsStore;
  }

  get plugins() {
    return this.pluginsStore.pluginsPlain;
  }
}
