import { isExtensionRuntimeAvailable } from "../shared/browser-api";

if (isExtensionRuntimeAvailable()) {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (message === "PHISHCHECK_PING") {
      sendResponse({ supported: location.hostname === "mail.google.com" });
    }
  });
}