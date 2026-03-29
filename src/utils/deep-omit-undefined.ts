function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepOmitUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const pruned = deepOmitUndefined(item);
      if (pruned !== item) changed = true;
      return pruned;
    });
    return (changed ? next : value) as T;
  }

  if (!isPlainRecord(value)) {
    return value;
  }

  let changed = false;
  const next: Record<string, unknown> = {};

  for (const key of Object.keys(value)) {
    const v = value[key];
    if (v === undefined) {
      changed = true;
      continue;
    }
    const pruned = deepOmitUndefined(v);
    if (pruned !== v) changed = true;
    next[key] = pruned;
  }

  return (changed ? next : value) as T;
}
