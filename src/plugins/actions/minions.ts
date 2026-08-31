import type { AnyAcceptedMasterRequirement } from "../shared/accepted-masters";
import type { ActionPlugin } from "../shared/action-plugin";

export type MinionsActionSelectedMinion = {
  minion_id: string;
  salt_master: string;
};

export type MinionsActionContext = {
  collectionSlug: string;
  collectionTitle?: string;
  query: Record<string, unknown>;
  selectedMinions: MinionsActionSelectedMinion[];
};

export type MinionsActionPlugin = ActionPlugin<MinionsActionContext, AnyAcceptedMasterRequirement>;
