import type { FileBrowserTransferItem } from "../model/upload-types";

export function groupUploadsByTargetDirectory<TItem extends FileBrowserTransferItem>(
  uploads: ReadonlyMap<string, TItem>
): Array<{ path: string | null; items: Map<string, TItem> }> {
  const groups = new Map<string | null, Map<string, TItem>>();
  const order: Array<string | null> = [];

  for (const [id, upload] of uploads) {
    const path =
      upload.targetDirectory != null && upload.targetDirectory.length > 0
        ? upload.targetDirectory
        : null;
    let items = groups.get(path);
    if (items == null) {
      items = new Map();
      groups.set(path, items);
      order.push(path);
    }
    items.set(id, upload);
  }

  return order.map((path) => ({ path, items: groups.get(path)! }));
}
