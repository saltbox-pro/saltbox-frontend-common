import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const roots = new WeakMap<Element, Root>();

export function mountSingletonReactRoot(elementId: string, node: ReactNode): void {
  if (typeof document === "undefined") {
    return;
  }

  let container = document.getElementById(elementId);
  if (container == null) {
    container = document.createElement("div");
    container.id = elementId;
    document.body.appendChild(container);
  }

  if (roots.has(container)) {
    return;
  }

  const root = createRoot(container);
  roots.set(container, root);
  root.render(node);
}
