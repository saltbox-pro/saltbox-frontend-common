import {
  isFileBrowserSafePathSegment,
  splitPathSegments,
  type FileBrowserPathStyle,
} from "./path-utils";

export const FILE_BROWSER_LOCATION_PATH_PARAM = "path";
export const FILE_BROWSER_LOCATION_FILE_PARAM = "file";
export const FILE_BROWSER_LOCATION_SOURCE_PARAM = "source";

export interface FileBrowserLocationQuery {
  path: string | null;
  file: string | null;
  source: string | null;
}

export type FileBrowserLocationQueryPatch = {
  path?: string | null;
  file?: string | null;
  source?: string | null;
};

function readOptionalParam(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key);
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readFileBrowserLocationQuery(
  searchParams: URLSearchParams
): FileBrowserLocationQuery {
  const fileRaw = readOptionalParam(searchParams, FILE_BROWSER_LOCATION_FILE_PARAM);
  const file = fileRaw != null && isFileBrowserSafePathSegment(fileRaw) ? fileRaw.trim() : null;

  return {
    path: readOptionalParam(searchParams, FILE_BROWSER_LOCATION_PATH_PARAM),
    file,
    source: readOptionalParam(searchParams, FILE_BROWSER_LOCATION_SOURCE_PARAM),
  };
}

export function toFileBrowserLocationQueryPath(
  path: string,
  pathStyle: FileBrowserPathStyle = "posix"
): string {
  if (pathStyle !== "win32") {
    return path;
  }

  const segments = splitPathSegments(path, "win32");
  if (segments.length === 0) {
    return path.replace(/\\/g, "/");
  }

  if (segments.length === 1) {
    return `${segments[0]}/`;
  }

  return `${segments[0]}/${segments.slice(1).join("/")}`;
}

export function applyFileBrowserLocationQuery(
  searchParams: URLSearchParams,
  patch: FileBrowserLocationQueryPatch
): URLSearchParams {
  const current = readFileBrowserLocationQuery(searchParams);
  const source =
    "source" in patch
      ? patch.source == null || patch.source.trim() === ""
        ? null
        : patch.source
      : current.source;
  const path =
    "path" in patch
      ? patch.path == null || patch.path.trim() === ""
        ? null
        : patch.path
      : current.path;
  const file =
    "file" in patch
      ? patch.file == null || patch.file.trim() === "" || !isFileBrowserSafePathSegment(patch.file)
        ? null
        : patch.file.trim()
      : current.file;

  const next = new URLSearchParams();

  const locationKeys = new Set([
    FILE_BROWSER_LOCATION_SOURCE_PARAM,
    FILE_BROWSER_LOCATION_PATH_PARAM,
    FILE_BROWSER_LOCATION_FILE_PARAM,
  ]);

  searchParams.forEach((value, key) => {
    if (!locationKeys.has(key)) {
      next.append(key, value);
    }
  });

  if (source != null) {
    next.set(FILE_BROWSER_LOCATION_SOURCE_PARAM, source);
  }
  if (path != null) {
    next.set(FILE_BROWSER_LOCATION_PATH_PARAM, path);
  }
  if (file != null) {
    next.set(FILE_BROWSER_LOCATION_FILE_PARAM, file);
  }

  return next;
}

export function clearFileBrowserLocationQueryFromWindow(): void {
  const current = new URLSearchParams(window.location.search);
  const location = readFileBrowserLocationQuery(current);
  if (location.path == null && location.file == null && location.source == null) {
    return;
  }

  const next = applyFileBrowserLocationQuery(current, {
    path: null,
    file: null,
    source: null,
  });
  const search = next.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}
