export type PluginLocalizedLabel = { en?: string; ru?: string } | string;

export type ParcelPlugin = {
  key: string;
  label?: PluginLocalizedLabel;
  parcel: unknown;
};
