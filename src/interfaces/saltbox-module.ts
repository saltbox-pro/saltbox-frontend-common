import singleSpaReact from "single-spa-react";
import { LocaleStore } from "./locale-store";
import { PluginsStore } from "./plugins-store";

export interface SaltboxModule {
  name: string;
  singleSpaLifecycle: ReturnType<typeof singleSpaReact>;
  path: string;

  settingsConfig?: any; // MenuItem
  menuConfig?: any; // MenuItem

  plugins?: Record<string, any[]>;

  init: (
    authStore: any,
    services: Array<{ service_name: string; env: any }>, // env: EnvInterface
    localeStore: LocaleStore,
    pluginsStore: PluginsStore
  ) => void;
}
