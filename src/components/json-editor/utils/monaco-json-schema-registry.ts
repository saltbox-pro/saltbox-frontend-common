import type { JsonEditorSchema } from "../types";

type MonacoSchemaEntry = {
  uri: string;
  fileMatch?: string[];
  schema?: object;
};

type MonacoJsonApi = {
  json: {
    jsonDefaults: {
      diagnosticsOptions: {
        schemas?: readonly MonacoSchemaEntry[];
      };
      setDiagnosticsOptions: (options: Record<string, unknown>) => void;
    };
  };
};

const SALTBOX_MONACO_SCHEMA_URI_PREFIX = "inmemory://saltbox/";

const schemaRefCounts = new Map<string, number>();
const schemaRegistrations = new Map<string, JsonEditorSchema>();
const pendingSync = new Set<MonacoJsonApi>();

function isManagedSchemaUri(uri: string): boolean {
  return uri.startsWith(SALTBOX_MONACO_SCHEMA_URI_PREFIX);
}

function syncMonacoSchemas(monaco: MonacoJsonApi): void {
  const current = monaco.json.jsonDefaults.diagnosticsOptions;
  const foreignSchemas = [...(current.schemas ?? [])].filter(
    (schema) => !isManagedSchemaUri(schema.uri)
  );

  monaco.json.jsonDefaults.setDiagnosticsOptions({
    ...current,
    validate: true,
    schemaValidation: "error",
    schemas: [...foreignSchemas, ...schemaRegistrations.values()],
  });
}

function scheduleSync(monaco: MonacoJsonApi): void {
  pendingSync.add(monaco);
  queueMicrotask(() => {
    if (!pendingSync.delete(monaco)) {
      return;
    }
    syncMonacoSchemas(monaco);
  });
}

export function acquireJsonEditorSchema(
  monaco: MonacoJsonApi,
  registration: JsonEditorSchema
): void {
  const { uri } = registration;
  schemaRefCounts.set(uri, (schemaRefCounts.get(uri) ?? 0) + 1);
  schemaRegistrations.set(uri, registration);
  scheduleSync(monaco);
}

export function releaseJsonEditorSchema(monaco: MonacoJsonApi, uri: string): void {
  const count = schemaRefCounts.get(uri) ?? 0;
  if (count <= 1) {
    schemaRefCounts.delete(uri);
    schemaRegistrations.delete(uri);
  } else {
    schemaRefCounts.set(uri, count - 1);
  }
  scheduleSync(monaco);
}

export function resetJsonEditorSchemaRegistryForTests(): void {
  schemaRefCounts.clear();
  schemaRegistrations.clear();
  pendingSync.clear();
}

export function getJsonEditorSchemaRegistrySnapshotForTests() {
  return {
    refCounts: Object.fromEntries(schemaRefCounts),
    uris: [...schemaRegistrations.keys()],
  };
}
