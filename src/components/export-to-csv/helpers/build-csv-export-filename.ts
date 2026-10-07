export function buildCsvExportFilename(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "_").split(".")[0];
  return `${prefix}_${timestamp}.csv`;
}
