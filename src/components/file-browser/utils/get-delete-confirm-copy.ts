import type { FileBrowserItemKind, FileBrowserLocaleOverrides } from "../model/types";

import { interpolateTemplate } from "./interpolate-template";

type Translate = (key: string, options?: { name: string }) => string;

export interface DeleteConfirmCopy {
  title: string;
  question: string;
  warning: string;
}

export function getDeleteConfirmCopy({
  itemKind,
  itemName,
  locale,
  t,
}: {
  itemKind: FileBrowserItemKind;
  itemName: string;
  locale?: FileBrowserLocaleOverrides;
  t: Translate;
}): DeleteConfirmCopy {
  const kindKey = itemKind === "directory" ? "directory" : "file";
  const name = itemName.trim();

  const title =
    (kindKey === "directory"
      ? locale?.actions?.deleteTitleDirectory
      : locale?.actions?.deleteTitleFile) ?? t(`file-browser.actions.delete-title-${kindKey}`);

  const questionOverride =
    kindKey === "directory"
      ? locale?.actions?.deleteConfirmDirectory
      : locale?.actions?.deleteConfirmFile;
  const question =
    questionOverride != null && questionOverride.length > 0
      ? interpolateTemplate(questionOverride, { name })
      : t(`file-browser.actions.delete-confirm-${kindKey}`, { name });

  const warningOverride =
    kindKey === "directory"
      ? locale?.actions?.deleteConfirmDirectoryWarning
      : locale?.actions?.deleteConfirmFileWarning;
  const warning =
    warningOverride != null && warningOverride.length > 0
      ? interpolateTemplate(warningOverride, { name })
      : t(`file-browser.actions.delete-confirm-${kindKey}-warning`);

  return { title, question, warning };
}
