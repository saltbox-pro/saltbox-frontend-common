function subscribe(eventName: string, listener: (event: CustomEvent) => void) {
  document.addEventListener(eventName, listener);
}

function unsubscribe(eventName: string, listener: (event: CustomEvent) => void) {
  document.removeEventListener(eventName, listener);
}

function publish<T = any>(eventName: string, data: T) {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
