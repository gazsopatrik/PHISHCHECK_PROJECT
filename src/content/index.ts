import type { PhishCheckMessage, PhishCheckResponse } from "../shared/messages";
import { GmailProviderAdapter } from "../providers/gmail/adapter";

// Content scripts are loaded as classic scripts by Opera GX, so this entry must
// stay self-contained and must not depend on an ESM import at runtime.
if (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined") {
  const provider = new GmailProviderAdapter();

  chrome.runtime.onMessage.addListener((message: PhishCheckMessage, _sender, sendResponse: (response: PhishCheckResponse) => void) => {
    if (message === "PHISHCHECK_PING") {
      sendResponse({ ok: true, supported: provider.isSupportedPage() });
      return false;
    }

    if (message === "PHISHCHECK_EXTRACT_EMAIL") {
      provider.extractCurrentEmail().then((email) => {
        sendResponse({ ok: true, email });
      }).catch((error: unknown) => {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : "Email extraction failed." });
      });
      return true;
    }

    if (message === "PHISHCHECK_CLEAR_HIGHLIGHTS") {
      provider.clearHighlights();
      sendResponse({ ok: true });
      return false;
    }

    if (typeof message === "object" && message.type === "PHISHCHECK_HIGHLIGHT") {
      provider.highlightFinding(message.finding);
      sendResponse({ ok: true });
      return false;
    }

    return false;
  });
}