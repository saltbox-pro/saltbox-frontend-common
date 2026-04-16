const DEFAULT_MASK = "******";

type PathPart = string;
type Path = PathPart[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectPasswordPathsFromUiSchema(uiSchema: unknown, basePath: Path = []): Path[] {
  if (!isRecord(uiSchema)) {
    return [];
  }

  const paths: Path[] = [];

  if (uiSchema["ui:widget"] === "password") {
    paths.push(basePath);
  }

  for (const [key, child] of Object.entries(uiSchema)) {
    if (key.startsWith("ui:")) {
      continue;
    }
    paths.push(...collectPasswordPathsFromUiSchema(child, [...basePath, key]));
  }

  return paths;
}

function collectPasswordPathsFromJsonSchema(schema: unknown, basePath: Path = []): Path[] {
  if (!isRecord(schema)) {
    return [];
  }

  const paths: Path[] = [];

  if (schema.format === "password") {
    paths.push(basePath);
  }

  const properties = schema.properties;
  if (isRecord(properties)) {
    for (const [propName, propSchema] of Object.entries(properties)) {
      paths.push(...collectPasswordPathsFromJsonSchema(propSchema, [...basePath, propName]));
    }
  }

  const items = schema.items;
  if (items) {
    paths.push(...collectPasswordPathsFromJsonSchema(items, [...basePath, "items"]));
  }

  return paths;
}

function applyMaskAtPath(data: unknown, path: Path, mask: string): unknown {
  if (path.length === 0) {
    if (data === undefined || data === null) {
      return data;
    }
    return mask;
  }

  const [head, ...tail] = path;

  if (head === "items") {
    if (!Array.isArray(data)) {
      return data;
    }
    return data.map((item) => applyMaskAtPath(item, tail, mask));
  }

  if (!isRecord(data)) {
    return data;
  }

  if (!(head in data)) {
    return data;
  }

  const nextValue = applyMaskAtPath(data[head], tail, mask);
  if (nextValue === data[head]) {
    return data;
  }

  return {
    ...data,
    [head]: nextValue,
  };
}

function uniqPaths(paths: Path[]): Path[] {
  const seen = new Set<string>();
  const result: Path[] = [];

  for (const p of paths) {
    const key = p.join(".");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
  }

  return result;
}

type MaskPasswordFieldsOptions = {
  mask?: string;
};

export function maskPasswordFields<TData>(
  data: TData,
  jsonSchema?: unknown,
  uiSchema?: unknown,
  options?: MaskPasswordFieldsOptions
): TData {
  const mask = options?.mask ?? DEFAULT_MASK;

  const passwordPaths = uniqPaths([
    ...collectPasswordPathsFromUiSchema(uiSchema),
    ...collectPasswordPathsFromJsonSchema(jsonSchema),
  ]);

  return passwordPaths.reduce((acc, path) => applyMaskAtPath(acc, path, mask) as TData, data);
}
