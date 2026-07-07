import { UiEvent } from "../../interfaces/ui-events";
import { publish, subscribe } from "../custom-events";

export function publishAcceptedMastersChanged(): void {
  publish(UiEvent.AcceptedMastersChanged, undefined);
}

export function subscribeAcceptedMastersChanged(onChanged: () => void): void {
  subscribe(UiEvent.AcceptedMastersChanged, onChanged);
}
