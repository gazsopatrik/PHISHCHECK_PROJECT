# Development Log

This file records the implementation work for PhishCheck. Entries are written in English so repository decisions remain accessible to contributors.

## 2026-07-29 — Project initialization

### Completed

- Reviewed the complete project specification.
- Corrected the specification's character encoding and made it UTF-8 compatible.
- Reframed the product as Opera GX-first while preserving Chromium compatibility.
- Confirmed that `gazsopatrik/PHISHCHECK_PROJECT` exists and is writable through the GitHub connector.
- Added the initial English project README.
- Added this development log to the repository.

### Decisions

- Opera GX is the primary MVP validation target.
- The extension will use standard Manifest V3 and browser-compatible APIs, not Opera-proprietary APIs.
- Gmail DOM extraction will remain isolated behind a provider adapter.
- Analysis will be deterministic and local in the MVP.
- The implementation will fail explicitly when extraction is incomplete instead of fabricating data.

## Phase 1 — Foundation

### Completed

- Added strict TypeScript and Vite configuration.
- Added a Manifest V3 extension manifest with minimum initial permissions.
- Added background, content-script, and popup entry points.
- Added the browser API compatibility wrapper.
- Added the initial Opera GX-oriented popup styling and restrictive extension CSP.
- Added architecture, privacy, security, rules, and testing documentation.
- Added an initial Vitest smoke test.
- Added ESLint 9 flat configuration.
- Added `.gitignore` and the dependency lockfile.

### Validation

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 1 test file, 1 test.
- Opera GX manual installation test — pending until the unpacked build is loaded in the browser.

## Phase 2 — Gmail extraction foundation

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

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 2 test files, 4 tests.
- Opera GX manual installation and live Gmail DOM validation — pending.

## Phase 3 — Deterministic link and sender rule foundation

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

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 5 test files, 13 tests.
- Opera GX manual validation — pending.

### Technical note

The registrable-domain helper intentionally uses a small explicit multi-label suffix set in this phase. A maintained Public Suffix List strategy is required before global production use.

## Phase 4 — Scoring, confidence, and correlations

### Completed

- Added `AnalysisResult`, risk-level, confidence-level, and category scoring models.
- Added category caps for sender, links, content, attachments, consistency, and missing information.
- Added normalized 0–100 risk scoring with the specified risk thresholds.
- Added separate confidence calculation based on missing metadata and extraction warnings.
- Added user-facing summary and limitation generation.
- Added a sender-brand plus link-destination correlation rule.
- Added scoring, engine, confidence, and correlation tests.
- Added `SCORING.md` to document scoring and confidence decisions.

### Validation

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 7 test files, 16 tests.
- Opera GX manual validation — pending.

## Phase 5 — Content and attachment analysis

### Completed

- Added deterministic English content rules for urgency, credential requests, financial requests, gift cards, and remote access/software actions.
- Kept urgency low severity when it appears without stronger evidence.
- Added executable, script, double-extension, macro-enabled document, and archive attachment rules.
- Kept attachment analysis metadata-only; no attachment is downloaded, opened, extracted, or executed.
- Integrated content and attachment findings into the main analysis engine.
- Added tests for matched evidence, low-severity urgency, dangerous attachment types, and final score integration.
- Documented the Phase 5 rule behavior in `RULES.md`.

### Validation

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 8 test files, 20 tests.
- Opera GX manual validation — pending.

## Phase 6 — Consistency rules and functional popup flow

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

- `pnpm build` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 9 test files, 22 tests.
- Opera GX manual installation and live Gmail analysis — pending.

### Next step

Begin Phase 7: implement highlight controls, clear-highlights messaging, and a more complete accessible result UI.
