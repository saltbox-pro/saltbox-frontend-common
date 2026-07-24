import type { MaterialSymbol } from "@material-symbols/font-300";

import type { FileBrowserItem } from "../model/types";

import { guessMimeFromName } from "./guess-mime-from-name";

export function getFileIcon(type: string): MaterialSymbol {
  if (type === "directory") {
    return "folder";
  }
  if (type.startsWith("image/")) {
    return "image";
  }
  if (type.startsWith("video/")) {
    return "video_file";
  }
  if (type.startsWith("audio/")) {
    return "audio_file";
  }
  if (type.includes("javascript") || type.includes("ecmascript")) {
    return "javascript";
  }
  if (type.startsWith("text/")) {
    return "description";
  }
  if (type.includes("json")) {
    return "file_json";
  }
  if (type.includes("pdf")) {
    return "picture_as_pdf";
  }
  if (type.includes("zip") || type.includes("tar") || type.includes("compressed")) {
    return "folder_zip";
  }
  return "draft";
}

export function getFileBrowserItemIcon(item: FileBrowserItem): MaterialSymbol {
  if (item.kind === "directory") {
    return getFileIcon("directory");
  }

  const iconType = item.iconHint ?? guessMimeFromName(item.name);
  return getFileIcon(iconType);
}
