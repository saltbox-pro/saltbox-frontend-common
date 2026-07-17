import { loader } from "@monaco-editor/react";

/**
 * Shared Monaco loader instance. Consumers call `.config({ monaco })` to bind
 * their bundled Monaco, keeping a single instance across microfrontends.
 */
const slsEditorMonacoLoader = loader;

export { slsEditorMonacoLoader };
