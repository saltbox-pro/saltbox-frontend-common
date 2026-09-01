import type { MinionDetailActionPlugin } from "./actions/minion-detail";
import type { MinionsActionPlugin } from "./actions/minions";
import type { ParcelPlugin } from "./shared/types";
import type { MinionDetailTabPlugin } from "./tabs/minion-detail";

export type JobsJobModalCreatePlugin = ParcelPlugin;
export type MinionsTaskModalCreatePlugin = ParcelPlugin;
export type MinionsPageActionsButtonPlugin = ParcelPlugin;

export type PluginSlotRegistry = {
  "minion.detail.actions": MinionDetailActionPlugin;
  "minions.actions": MinionsActionPlugin;
  "minion.detail.tabs": MinionDetailTabPlugin;
  "minions.tabs": MinionDetailTabPlugin;
  "jobs.jobmodal.create": JobsJobModalCreatePlugin;
  "minions.taskmodal.create": MinionsTaskModalCreatePlugin;
  "minions.pageactionsbuttons": MinionsPageActionsButtonPlugin;
};

export type PluginsManifest = {
  [K in keyof PluginSlotRegistry]?: Array<PluginSlotRegistry[K]>;
};

export type PluginsStoreApi = {
  plugins: PluginsManifest;
  addPlugins: (manifest: PluginsManifest) => void;
};
