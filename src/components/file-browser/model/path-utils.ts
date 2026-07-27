export type FileBrowserPathStyle = "posix" | "win32";

export function isFileBrowserSafePathSegment(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") {
    return false;
  }
  if (trimmed.includes("/") || trimmed.includes("\\")) {
    return false;
  }
  return true;
}

export function splitPathSegments(
  path: string,
  pathStyle: FileBrowserPathStyle = "posix"
): string[] {
  if (pathStyle === "win32") {
    const trimmed = path.trim();
    const match = trimmed.match(/^([A-Za-z]:)[\\/]*(.*)$/);
    if (!match) {
      return trimmed.split(/[\\/]+/).filter(Boolean);
    }

    const drive = match[1];
    const rest = match[2];
    const parts = rest ? rest.split(/[\\/]+/).filter(Boolean) : [];
    return [drive, ...parts];
  }

  if (path === "/" || path === "") {
    return [];
  }

  return path.split("/").filter(Boolean);
}

export function isRootPath(path: string, pathStyle: FileBrowserPathStyle = "posix"): boolean {
  if (pathStyle === "win32") {
    return /^[A-Za-z]:[\\/]*$/.test(path.trim());
  }

  return path === "/" || path === "";
}

export function getRootPath(path: string, pathStyle: FileBrowserPathStyle = "posix"): string {
  if (pathStyle === "win32") {
    const segments = splitPathSegments(path, pathStyle);
    if (segments.length === 0) {
      return path;
    }
    return buildPathFromSegments([segments[0]], pathStyle);
  }

  return "/";
}

export function buildPathFromSegments(
  segments: string[],
  pathStyle: FileBrowserPathStyle = "posix"
): string {
  if (pathStyle === "win32") {
    if (segments.length === 0) {
      return "";
    }

    const drive = segments[0];
    if (segments.length === 1) {
      return `${drive}\\`;
    }

    return `${drive}\\${segments.slice(1).join("\\")}`;
  }

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

export function getFileBrowserParentPath(
  path: string,
  pathStyle: FileBrowserPathStyle = "posix"
): string | null {
  if (pathStyle === "win32") {
    if (isRootPath(path, pathStyle)) {
      return null;
    }

    const segments = splitPathSegments(path, pathStyle);
    if (segments.length <= 1) {
      return null;
    }

    return buildPathFromSegments(segments.slice(0, -1), pathStyle);
  }

  const segments = splitPathSegments(path, pathStyle);
  if (segments.length === 0) {
    return null;
  }

  return buildPathFromSegments(segments.slice(0, -1), pathStyle);
}

export function joinFileBrowserPathChild(
  currentPath: string,
  name: string,
  pathStyle: FileBrowserPathStyle = "posix"
): string {
  if (!isFileBrowserSafePathSegment(name)) {
    throw new Error("Invalid path segment");
  }

  const segment = name.trim();

  if (pathStyle === "win32") {
    if (isRootPath(currentPath, pathStyle)) {
      const drive = currentPath.trim().replace(/[\\/]+$/, "");
      return `${drive}\\${segment}`;
    }

    const segments = splitPathSegments(currentPath, pathStyle);
    return buildPathFromSegments([...segments, segment], pathStyle);
  }

  const base = currentPath.replace(/\/+$/, "") || "/";
  if (base === "/") {
    return `/${segment}`;
  }

  return `${base}/${segment}`;
}
