export type HasAcceptedMastersCheckerParams = {
  loadAcceptedMastersCount: () => Promise<number>;
  maxAgeMs?: number;
};

export type HasAcceptedMastersCheckOptions = {
  force?: boolean;
};

export function createHasAcceptedMastersChecker({
  loadAcceptedMastersCount,
  maxAgeMs = 30_000,
}: HasAcceptedMastersCheckerParams) {
  let cache: { value: boolean; ts: number } | null = null;
  let inFlight: Promise<boolean> | null = null;

  const invalidate = (): void => {
    cache = null;
  };

  const check = async (options?: HasAcceptedMastersCheckOptions): Promise<boolean> => {
    const force = options?.force ?? false;
    const now = Date.now();

    if (!force && cache && now - cache.ts <= maxAgeMs) {
      return cache.value;
    }

    if (!force && inFlight) {
      return inFlight;
    }

    const request = (async () => {
      const count = await loadAcceptedMastersCount();
      const value = count > 0;
      cache = { value, ts: Date.now() };
      return value;
    })();

    inFlight = request;
    try {
      return await request;
    } finally {
      if (inFlight === request) {
        inFlight = null;
      }
    }
  };

  return { check, invalidate };
}
