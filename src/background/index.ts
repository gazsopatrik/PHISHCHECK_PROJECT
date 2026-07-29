import { isExtensionRuntimeAvailable } from "../shared/browser-api";

if (isExtensionRuntimeAvailable()) {
  chrome.runtime.onInstalled.addListener(() => {
    console.info("PhishCheck extension installed");
  });
}