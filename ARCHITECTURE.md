# Architecture

PhishCheck is a Manifest V3 browser extension with three runtime surfaces:

- `background`: service-worker lifecycle and message routing;
- `content`: Gmail page inspection and future in-email highlighting;
- `popup`: user-facing status and analysis controls.

Provider adapters own Gmail-specific DOM selectors. Analysis rules receive normalized `EmailMessage` data and return explainable `SecurityFinding` objects. No rule may query Gmail DOM directly.

The browser API is accessed through `src/shared/browser-api.ts` so Opera GX compatibility remains explicit and browser-specific assumptions are isolated.

## Message flow

1. The popup queries the active tab.
2. The Gmail content script asks `GmailProviderAdapter` to extract the current message.
3. The normalized `EmailMessage` is returned to the popup.
4. The popup runs the local analysis engine with the configured brand list.
5. The popup renders findings using text nodes and does not insert email HTML.

Extraction, analysis, and presentation remain separate so a provider failure cannot silently create a security verdict.

## Phase 6 boundary

The current popup flow performs a local analysis and renders the result. Highlight controls and richer result interactions are the next UI phase.