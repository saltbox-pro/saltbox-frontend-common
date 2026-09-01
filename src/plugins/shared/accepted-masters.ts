export type AcceptedMastersScope = "current" | "any";

export type AcceptedMastersRequirement = {
  scope: AcceptedMastersScope;
};

export type CurrentMasterAcceptedMastersRequirement = {
  scope: "current";
};

export type AnyAcceptedMasterRequirement = {
  scope: "any";
};

export function requireCurrentMasterAccepted(): CurrentMasterAcceptedMastersRequirement {
  return { scope: "current" };
}

export function requireAnyAcceptedMaster(): AnyAcceptedMasterRequirement {
  return { scope: "any" };
}
