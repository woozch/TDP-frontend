import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

let resolveReady: () => void;
/** Resolves when the MSW worker has started. Await before first API calls so list/create/delete are mocked. */
export const mswReady = new Promise<void>((r) => {
  resolveReady = r;
});

export function resolveMswReady(): void {
  resolveReady();
}

