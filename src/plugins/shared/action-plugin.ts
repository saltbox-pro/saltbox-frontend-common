import type { PluginLocalizedLabel } from "./types";

export type ActionPlugin<TContext, TAcceptedMasters = never> = {
  key: string;
  label: PluginLocalizedLabel;
  icon?: string;
  acceptedMasters?: TAcceptedMasters;
  onClick: (ctx: TContext) => void | Promise<void>;
  isDisabled?: (ctx: TContext) => boolean;
  isBusy?: (ctx: TContext) => boolean;
};
