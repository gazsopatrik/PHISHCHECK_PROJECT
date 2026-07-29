# Architecture

PhishCheck is a Manifest V3 browser extension with three runtime surfaces:

- `background`: service-worker lifecycle and message routing;
- `content`: Gmail page inspection and future in-email highlighting;
- `popup`: user-facing status and analysis controls.

Provider adapters will own Gmail-specific DOM selectors. Analysis rules will receive normalized `EmailMessage` data and return explainable `SecurityFinding` objects. No rule may query Gmail DOM directly.

The browser API is accessed through `src/shared/browser-api.ts` so Opera GX compatibility remains explicit and browser-specific assumptions are isolated.

## Phase 1 boundary

The current foundation verifies the extension entry points and CSP shape. It intentionally does not fabricate email data or produce placeholder analysis results. Gmail extraction and the first data models are the next implementation phase.