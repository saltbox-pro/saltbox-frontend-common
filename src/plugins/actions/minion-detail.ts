import type { CurrentMasterAcceptedMastersRequirement } from "../shared/accepted-masters";
import type { ActionPlugin } from "../shared/action-plugin";

export type MinionDetailActionContext = {
  minionId: string;
  saltMaster: string;
};

export type MinionDetailActionPlugin = ActionPlugin<
  MinionDetailActionContext,
  CurrentMasterAcceptedMastersRequirement
>;
