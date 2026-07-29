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

### Next step

Begin Phase 4: add the scoring engine, category caps, confidence calculation, and correlation rules around the existing findings.
