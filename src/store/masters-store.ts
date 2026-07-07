import {
  createHasAcceptedMastersChecker,
  subscribeAcceptedMastersChanged,
} from "../utils/accepted-masters";

export type CreateMastersStoreParams = {
  loadAcceptedMastersCount: () => Promise<number>;
  maxAgeMs?: number;
};

export type HasAcceptedMastersParams = {
  force?: boolean;
};

export type MastersStore = {
  hasAcceptedMasters: (params?: HasAcceptedMastersParams) => Promise<boolean>;
  invalidateHasAcceptedMastersCache: () => void;
};

export function createMastersStore({
  loadAcceptedMastersCount,
  maxAgeMs,
}: CreateMastersStoreParams): MastersStore {
  const checker = createHasAcceptedMastersChecker({ loadAcceptedMastersCount, maxAgeMs });

  subscribeAcceptedMastersChanged(() => {
    checker.invalidate();
  });

  return {
    hasAcceptedMasters: (params) => checker.check(params),
    invalidateHasAcceptedMastersCache: () => checker.invalidate(),
  };
}
