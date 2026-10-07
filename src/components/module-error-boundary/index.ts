export { withParcelBoundary } from "./boundaries/with-parcel-boundary";
export {
  BlockErrorFallback,
  type BlockErrorFallbackVariant,
} from "./fallbacks/block-error-fallback";
export { TableErrorBoundary } from "./boundaries/table-error-boundary";
export { PageHeaderErrorBoundary } from "./boundaries/page-header-error-boundary";
export { FiltersErrorBoundary } from "./boundaries/filters-error-boundary";
export {
  createModuleErrorBoundaryKit,
  type CreateModuleErrorBoundaryKitOptions,
} from "./factories/create-module-error-boundary-kit";
export { createSingleSpaErrorBoundary } from "./factories/create-single-spa-error-boundary";
export { LOCALE_CHANGE_EVENT } from "../../i18n/common";
