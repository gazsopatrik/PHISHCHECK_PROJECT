# Development Log

This file records the implementation work for PhishCheck. Entries are written in English so the repository history and project decisions remain accessible to contributors.

## 2026-07-29 — Project initialization

### Completed

- Reviewed the complete project specification.
- Corrected the specification's character encoding and made it UTF-8 compatible.
- Reframed the product as Opera GX-first while preserving Chromium compatibility.
- Confirmed that the GitHub repository `gazsopatrik/PHISHCHECK_PROJECT` exists and is writable through the GitHub connector.
- Added the initial English project README.
- Added this development log to document future implementation steps.

### Decisions

- Opera GX is the primary MVP validation target.
- The extension will use standard Manifest V3 and browser-compatible APIs, not Opera-proprietary APIs.
- Gmail DOM extraction will remain isolated behind a provider adapter.
- Analysis will be deterministic and local in the MVP.
- The implementation will fail explicitly when extraction is incomplete instead of fabricating data.

### Next step

Begin Phase 1: create the TypeScript/Vite/Manifest V3 foundation, browser compatibility wrapper, extension entry points, documentation skeleton, and initial automated test configuration.
