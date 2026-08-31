export type WithAcceptedMastersCheckCallParams = {
  checkHasAcceptedMasters: () => Promise<boolean>;
  onSuccess: () => void | Promise<void>;
  navigate: (to: string) => void;
  warningActionText?: string;
  errorMessage?: string;
};
