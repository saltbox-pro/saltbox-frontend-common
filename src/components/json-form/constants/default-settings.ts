import type { Experimental_DefaultFormStateBehavior } from "@rjsf/utils/lib/types.js";

export const JSON_FORM_DEFAULT_STATE_BEHAVIOR_SETTINGS: Experimental_DefaultFormStateBehavior = {
  allOf: "populateDefaults",
  emptyObjectFields: "populateAllDefaults",
} as const;
