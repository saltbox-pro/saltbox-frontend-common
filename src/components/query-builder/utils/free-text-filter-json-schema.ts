const FREE_TEXT_FILTER_MODEL_PATH_PREFIX = "inmemory://saltbox/free-text-filter";

export function getFreeTextFilterModelPath(
  instanceId: string,
  revision: number,
  mountId: number
): string {
  const safeInstanceId = encodeURIComponent(instanceId);
  return `${FREE_TEXT_FILTER_MODEL_PATH_PREFIX}-${safeInstanceId}-${revision}-${mountId}.json`;
}

function getFreeTextFilterSchemaUri(modelPath: string): string {
  return `${modelPath}.schema.json`;
}

export function getFreeTextFilterJsonSchemaRegistration(schemaBody: object, modelPath: string) {
  return {
    uri: getFreeTextFilterSchemaUri(modelPath),
    fileMatch: [modelPath],
    schema: schemaBody,
  };
}
