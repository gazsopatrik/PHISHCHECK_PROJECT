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

### Next step

Begin Phase 2: implement the Gmail provider adapter, current-message detection, normalized email models, extraction warnings, and Gmail fixture tests.
