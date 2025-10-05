export interface PluginsStore {
  readonly pluginsPlain: Record<string, any[]>;
  addPlugins(plugins: Record<string, any[]>): void;
}
