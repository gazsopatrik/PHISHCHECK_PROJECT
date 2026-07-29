# Development Log

This file records the implementation work for PhishCheck. Entries are written in English so repository decisions remain accessible to contributors.

## 2026-07-29 â€” Project initialization

### Completed

- Reviewed the complete project specification.
- Corrected the specification's character encoding and made it UTF-8 compatible.
- Reframed the product as Opera GX-first while preserving Chromium compatibility.
- Confirmed that `gazsopatrik/PHISHCHECK_PROJECT` exists and is writable through the GitHub connector.
- Added the initial English project README to the repository.
- Added this development log to the repository.

### Decisions

- Opera GX is the primary MVP validation target.
- The extension will use standard Manifest V3 and browser-compatible APIs, not Opera-proprietary APIs.
- Gmail DOM extraction will remain isolated behind a provider adapter.
- Analysis will be deterministic and local in the MVP.
- The implementation will fail explicitly when extraction is incomplete instead of fabricating data.

### Next step

### Phase 1 foundation completed

- Added TypeScript strict configuration and Vite build configuration.
- Added a Manifest V3 extension manifest with minimum initial permissions.
- Added background, content-script, and popup entry points.
- Added the browser API compatibility wrapper.
- Added the initial Opera GX-oriented popup styling and CSP.
- Added architecture, privacy, security, rules, and testing documentation.
- Added an initial Vitest smoke test.
- Added ESLint 9 flat configuration.
- Added `.gitignore` and dependency lockfile.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 1 test file, 1 test.
- Opera GX manual installation test â€” pending until the unpacked build is loaded in the browser.

### Next step

## Phase 2 â€” Gmail extraction foundation

### Completed

- Added shared `EmailMessage`, `EmailAddress`, `ExtractedLink`, and `EmailAttachment` models.
- Added the provider adapter contract.
- Added `GmailProviderAdapter` with isolated selector definitions.
- Added supported-page and open-message detection.
- Added extraction for visible sender, recipients, subject, body text/HTML, links, attachments, and Gmail warnings.
- Added explicit extraction warnings and explicit failure when no reliable message body is found.
- Added stable PhishCheck IDs to extracted links for future highlighting.
- Added removable highlight support behind the provider adapter boundary.
- Added a Gmail credential-phishing HTML fixture.
- Added fixture-based tests for successful extraction, missing message content, and unsupported pages.
- Added `happy-dom` only for DOM fixture testing.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 2 test files, 4 tests.
- Opera GX manual installation and live Gmail DOM validation â€” pending.

### Next step

## Phase 3 â€” Deterministic link and sender rule foundation

### Completed

- Added analysis models for contexts, rules, severities, categories, brands, and explainable findings.
- Added reusable hostname normalization, registrable-domain, IP, punycode, domain-comparison, and Levenshtein utilities.
- Added safe URL parsing with malformed-input handling.
- Added detection for login paths, common URL shorteners, and suspicious redirect parameters.
- Added link rules for destination mismatch, IP destinations, HTTP login pages, punycode, shorteners, and redirect parameters.
- Added sender rules for punycode domains, brand impersonation, and company-style free-provider identities.
- Kept all rules independent of Gmail selectors and DOM implementation details.
- Added utility and rule tests, including malformed URLs and deceptive subdomain cases.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 5 test files, 13 tests.
- Opera GX manual validation â€” pending.

### Technical note

The registrable-domain helper intentionally uses a small explicit multi-label suffix set in this phase. A maintained Public Suffix List strategy is required before global production use.

### Next step

## Phase 4 â€” Scoring, confidence, and correlations

### Completed

- Added `AnalysisResult`, risk-level, confidence-level, and category scoring models.
- Added category caps for sender, links, content, attachments, consistency, and missing information.
- Added normalized 0â€“100 risk scoring with the specified risk thresholds.
- Added separate confidence calculation based on missing metadata and extraction warnings.
- Added user-facing summary and limitation generation.
- Added a sender-brand plus link-destination correlation rule.
- Added scoring, engine, confidence, and correlation tests.
- Added `SCORING.md` to document the scoring and confidence decisions.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 7 test files, 16 tests.
- Opera GX manual validation â€” pending.

### Next step

## Phase 5 â€” Content and attachment analysis

### Completed

- Added deterministic English content rules for urgency, credential requests, financial requests, gift cards, and remote access/software actions.
- Kept urgency low severity when it appears without stronger evidence.
- Added executable, script, double-extension, macro-enabled document, and archive attachment rules.
- Kept attachment analysis metadata-only; no attachment is downloaded, opened, extracted, or executed.
- Integrated content and attachment findings into the main analysis engine.
- Added tests for matched evidence, low-severity urgency, dangerous attachment types, and final score integration.
- Documented the Phase 5 rule behavior in `RULES.md`.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 8 test files, 20 tests.
- Opera GX manual validation â€” pending.

### Next step

## Phase 6 â€” Consistency rules and functional popup flow

### Completed

- Added signature-versus-sender consistency detection.
- Added sender-domain versus visible-link-domain inconsistency detection.
- Added missing sender, missing body, and extraction-warning findings.
- Added a typed popup/content-script message protocol.
- Connected the popup's Analyze Email action to the active Gmail tab.
- Connected the Gmail content script to the provider adapter for local extraction.
- Connected the popup to the local analysis engine and common brand definitions.
- Added user-readable score, risk level, confidence, findings, recommendations, and limitations rendering.
- Rendered result text through DOM nodes rather than inserting email HTML.
- Added user-readable extraction failure handling.
- Added consistency and missing-information tests.
- Improved popup heading semantics for keyboard and assistive-technology users.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 22 tests.
- Opera GX manual installation and live Gmail analysis â€” pending.

### Next step

Begin Phase 7: implement highlight controls, clear-highlights messaging, and a more complete accessible result UI.

## Phase 7 â€” Removable highlighting and accessible result controls

### Completed

- Added removable link and attachment highlighting in the Gmail provider adapter.
- Added a unique PhishCheck CSS class and temporary style element for highlights.
- Added cleanup that removes all highlight classes and the injected style element.
- Added popup controls for Highlight Suspicious Content and Remove Highlights.
- Added highlight message handling in the Gmail content script.
- Added visible focus indicators and secondary button styling.
- Kept severity text labels alongside color styling.
- Added an adapter test covering highlight creation and complete cleanup.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 23 tests.
- Opera GX manual installation, live highlighting, and keyboard smoke test â€” pending.

### Next step

Begin Phase 8: improve browser/runtime error handling, add broader Gmail fixtures, and prepare the first manual Opera GX validation checklist.

### Phase 8 follow-up â€” Gmail DOM compatibility fix

- Broadened Gmail body detection beyond the legacy `.a3s.aiL` selector.
- Added semantic fallbacks for message containers and `dir="ltr"`/`dir="auto"` body elements.
- Added fallback sender and subject selectors based on semantic attributes.
- Added a semantic-body fixture reproducing the previously missed message shape.
- Rebuilt the production `dist` output after the selector fix.

Validation after the fix:

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 27 tests.

## Phase 8 follow-up â€” Classic content-script bundle compatibility

- Removed the runtime ESM import from the Gmail content-script entry point.
- Kept the content script self-contained because Opera GX loads Manifest V3 content scripts as classic scripts.
- Verified the generated `dist/content.js` contains no top-level `import` statement.

Validation after the bundling fix:

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 27 tests.

### Phase 8 follow-up â€” Opera GX content-script connection fix

- Added `gmail.com` and `www.gmail.com` host support alongside `mail.google.com`.
- Added dynamic active-tab injection of the bundled content script when Opera GX reports no receiving content script.
- Added separate user-facing messaging for unsupported pages, no open message, and failed content-script connection.
- Updated the Manifest V3 Gmail matches and host permissions accordingly.
- Rebuilt the production `dist` output.

Validation after the connection fix:

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 27 tests.

## Phase 8 â€” Runtime handling, broader fixtures, and Opera GX checklist

### Completed

- Added an explicit popup preflight for unsupported pages and no-open-email states.
- Mapped content-script and extraction failures to user-readable messages without raw stack traces.
- Added legitimate marketing, missing-metadata, and attachment-malware-lure Gmail fixtures.
- Expanded Gmail adapter coverage for legitimate messages, missing sender data, and attachment metadata.
- Added the Opera GX manual smoke-test checklist.
- Linked the Opera GX checklist from the testing documentation and README.

### Validation

- `pnpm build` â€” passed.
- `pnpm lint` â€” passed.
- `pnpm test` â€” passed: 9 test files, 26 tests.
- Opera GX manual validation â€” checklist prepared; execution pending.

### Next step

Execute the Opera GX manual smoke test when the browser is available, then continue with release hardening and permission/security review.

## Phase 8 follow-up Ă˘â‚¬â€ť Opera GX callback API compatibility

- Replaced popup calls to `tabs.query`, `tabs.sendMessage`, and `scripting.executeScript` with callback-based wrappers.
- Read `chrome.runtime.lastError` inside each callback so Opera GX connection and injection failures are surfaced reliably.
- Kept dynamic content-script injection as a recovery path when the Gmail tab has no active receiver.
- Rebuilt the production `dist` output.

Validation after the compatibility fix:

- `pnpm build` Ă˘â‚¬â€ť passed.
- `pnpm lint` Ă˘â‚¬â€ť passed.
- `pnpm test` Ă˘â‚¬â€ť passed: 9 test files, 27 tests.

## Phase 9 â€” False-positive calibration and broader highlighting

- Narrowed credential and financial content patterns so ordinary account notices are not automatically treated as phishing requests.
- Changed missing extraction metadata from scored risk evidence to a zero-point limitation finding.
- Added message-body and link highlight targets.
- Prevented ordinary call-to-action text such as `WATCH VIDEO` from being parsed as a visible domain.
- Added highlight fallback matching by extracted href or destination hostname when Gmail rerenders and removes temporary IDs.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed with 29 tests.

## Phase 10 â€” Spam and scam-content detection calibration

- Added deterministic detection for adult-content sales lures, word obfuscation, and unverifiable rapid-result or authority claims.
- Added a correlation finding when multiple manipulative spam tactics appear in the same message.
- Changed confidence to represent the reliability of the visible-content analysis: full headers, sender authentication, URL reputation, and attachment contents are outside the local MVP, so a complete visible extraction is now medium confidence (75/100), not high confidence (100/100).
- Added regression tests based on manipulative adult-content spam phrasing.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed with 32 tests.

## Phase 10 follow-up â€” Evidence-level highlighting

- Added exact matched-text highlighting for content-rule evidence, including obfuscated words and unverifiable claims.
- Preserved the existing link and attachment highlights.
- Kept whole-message highlighting only as a fallback when a correlation has no precise text evidence.
- Made highlight cleanup unwrap injected text spans and restore the original visible text.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed with 33 tests.

