export type FileBrowserItemKind = "directory" | "file";

export interface FileBrowserItem {
  id: string;
  name: string;
  path: string;
  kind: FileBrowserItemKind;
  sizeBytes: number | null;
  modifiedAt: number | null;
  iconHint?: string;
}

export interface FileBrowserSourceItem {
  key: string;
  label: string;
}

export type FileBrowserLocaleOverrides = {
  empty?: string;
  awaitingDisk?: string;
  retry?: string;
  columns?: {
    name?: string;
    type?: string;
    size?: string;
    modified?: string;
    actions?: string;
  };
  type?: {
    directory?: string;
    file?: string;
  };
  nameModal?: {
    nameRequired?: string;
    nameInvalid?: string;
  };
  actions?: {
    download?: string;
    rename?: string;
    delete?: string;
    deleteTitleFile?: string;
    deleteTitleDirectory?: string;
    deleteConfirmFile?: string;
    deleteConfirmDirectory?: string;
    deleteConfirmFileWarning?: string;
    deleteConfirmDirectoryWarning?: string;
    yes?: string;
    cancel?: string;
    createFolder?: string;
    createFile?: string;
    create?: string;
    folderNamePlaceholder?: string;
    fileNamePlaceholder?: string;
    newNamePlaceholder?: string;
  };
};
