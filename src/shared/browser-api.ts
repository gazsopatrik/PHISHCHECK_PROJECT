export const browserApi = globalThis.chrome;

export function isExtensionRuntimeAvailable(): boolean {
  return typeof browserApi !== "undefined" && typeof browserApi.runtime !== "undefined";
}