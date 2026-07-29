# Development Log

This file records the implementation work for PhishCheck. Entries are written in English so repository decisions remain accessible to contributors.

## 2026-07-29 — Project initialization

Reviewed the complete specification, corrected its encoding, reframed the product as Opera GX-first, confirmed the GitHub repository, and added the English README and development log.

## Phase 1 — Foundation

Added strict TypeScript, Vite, Manifest V3, popup, background, content-script, browser API wrapper, documentation, ESLint, and initial tests.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed.

## Phase 2 — Gmail extraction foundation

Added normalized email models, provider adapter contract, Gmail selectors, Gmail extraction, explicit extraction warnings, highlight target IDs, fixture support, and Gmail DOM tests.

Validation: build, lint, and tests passed.

## Phase 3 — Deterministic link and sender rules

Added domain and URL utilities, IP/punycode/shortener/redirect checks, link mismatch rules, sender brand impersonation rules, free-provider checks, and utility/rule tests.

Validation: 5 test files, 13 tests passed.

## Phase 4 — Scoring, confidence, and correlations

Added category caps, 0–100 risk scoring, confidence calculation, limitations, user summaries, sender-brand/link correlation, and scoring tests.

Validation: 7 test files, 16 tests passed.

## Phase 5 — Content and attachment analysis

Added deterministic English urgency, credential, financial, gift-card, remote-access, executable, double-extension, macro-document, and archive rules. Integrated them into the analysis engine while keeping attachment processing metadata-only.

Validation: 8 test files, 20 tests passed.

## Phase 6 — Consistency rules and functional popup flow

Added signature and domain consistency checks, missing-information findings, typed extension messaging, Gmail extraction through the content script, local popup analysis, safe DOM-node result rendering, and user-readable runtime errors.

Validation: 9 test files, 22 tests passed.

## Phase 7 — Removable highlighting and accessible controls

Added removable link and attachment highlighting, unique PhishCheck CSS artifacts, cleanup messaging, popup highlight controls, focus indicators, text severity labels, and highlight cleanup tests.

Validation: 9 test files, 23 tests passed.

## Phase 8 — Runtime handling, broader fixtures, and Opera GX checklist

Added unsupported-page and no-open-email preflight, user-readable runtime errors, legitimate/missing-metadata/attachment-lure fixtures, broader adapter tests, and the `OPERA_GX_TESTING.md` manual checklist.

## Phase 8 follow-up — Gmail DOM compatibility fix

Broadened Gmail body, sender, and subject selectors beyond legacy classes and added a semantic-body fixture.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed with 27 tests.

## Phase 8 follow-up — Opera GX content-script connection fix

- Added `gmail.com` and `www.gmail.com` host support alongside `mail.google.com`.
- Added dynamic active-tab injection of the bundled content script when Opera GX reports no receiving content script.
- Added separate user-facing messaging for unsupported pages, no open message, and failed content-script connection.
- Updated the Manifest V3 Gmail matches and host permissions.
- Rebuilt the production `dist` output.

Validation: `pnpm build`, `pnpm lint`, and `pnpm test` passed with 27 tests.

Opera GX manual validation must be run against this freshly built `dist` directory.
