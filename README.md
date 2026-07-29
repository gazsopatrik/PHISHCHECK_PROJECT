# PhishCheck

Opera GX-first, privacy-preserving browser extension for analyzing phishing indicators in emails opened in Gmail.

PhishCheck is a defensive security tool. It performs deterministic analysis locally in the browser and explains why an email may be suspicious. It helps users slow down and verify sensitive requests; it does not guarantee that an email is legitimate.

> **Work in progress â€” experimental MVP.** PhishCheck is under active development and its detections, scores, confidence values, and Gmail highlighting are still being calibrated. Do not rely on it as the sole basis for a security, financial, or account-access decision. Always verify sensitive requests through an independent trusted channel.

## Project status

The project is in active MVP development. It is not production-ready and should be tested with representative Gmail messages before being relied on in daily use.

Current focus areas:

- Calibrating phishing, spam, and scam-content rules to reduce false positives and missed detections.
- Improving Gmail DOM compatibility and evidence-level highlighting.
- Expanding fixture-based and manual Opera GX validation.
- Keeping all analysis local while documenting the limits of visible-content-only inspection.

The primary target is Opera GX for desktop. The implementation uses standard Manifest V3 and WebExtension-compatible APIs so the same build can also support Chrome, Microsoft Edge, Brave, and other compatible Chromium browsers.

## MVP goals

- Detect whether a Gmail message is currently open.
- Extract visible sender, recipient, subject, body, links, attachments, and Gmail warnings.
- Analyze sender identity, destinations, brand impersonation, social-engineering language, attachments, and content consistency.
- Produce a transparent 0â€“100 risk score and a separate confidence level.
- Show evidence and recommended next actions for every finding.
- Highlight suspicious content inside Gmail without changing the email.
- Process email content locally without opening links or downloading attachments.

PhishCheck will never claim that an email is â€ś100% safeâ€ť.

## Target platform

### Primary

- Opera GX for desktop
- Gmail in Opera GX
- Manifest V3 extension APIs
- Opera GX dark-mode and narrow-extension-window compatibility

### Secondary

- Google Chrome
- Microsoft Edge
- Brave
- Other Chromium-based browsers with Manifest V3 support

Opera-specific proprietary APIs are not required. Browser integration is isolated behind a small compatibility layer so security analysis remains browser-independent.

## Planned architecture

```text
src/
â”śâ”€â”€ background/       Extension service worker and message routing
â”śâ”€â”€ content/          Gmail content script and highlighting
â”śâ”€â”€ popup/            User interface
â”śâ”€â”€ providers/gmail/  Gmail DOM extraction adapter
â”śâ”€â”€ analysis/         Deterministic security rules and scoring
â”śâ”€â”€ models/           Shared TypeScript data models
â”śâ”€â”€ rules/            Rule definitions and brand data
â”śâ”€â”€ storage/          Privacy-preserving local settings
â”śâ”€â”€ ui/               Reusable UI components and accessibility
â”śâ”€â”€ utils/            URL, domain, encoding, and security utilities
â””â”€â”€ tests/            Unit, integration, and Gmail fixture tests
```

Provider-specific DOM logic must not be mixed with analysis rules. Email content is treated as hostile input throughout the application.

## Privacy and security principles

- Email content is analyzed locally in the browser in the MVP.
- Full email bodies, sender addresses, URLs, and attachment names are not retained after the analysis session.
- Extracted URLs are never automatically visited.
- Attachments are never downloaded or opened.
- Email HTML is never inserted unsanitized into the extension UI.
- The extension requests only the minimum permissions required by the implementation.
- Missing or unreliable extraction results are reported explicitly; data is never invented.
- External reputation APIs and AI services are out of scope for the MVP and must be opt-in in future versions.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Loading the unpacked extension in Opera GX

1. Open Opera GX.
2. Navigate to `opera://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select the generated `dist` extension directory.
6. Open Gmail, open an email, and launch PhishCheck from the extension toolbar.

## Documentation

- [Project specification](./PhishCheck_Project_Specification.md)
- [Development log](./docs/DEVELOPMENT_LOG.md)
- [Architecture](./ARCHITECTURE.md)
- [Rules](./RULES.md)
- [Scoring](./SCORING.md)
- [Privacy](./PRIVACY.md)
- [Security](./SECURITY.md)
- [Testing](./TESTING.md)
- [Opera GX manual testing](./OPERA_GX_TESTING.md)

## Scope limitations

The MVP does not provide full email-header authentication results, OCR, QR-code decoding, reputation lookups, automatic link detonation, attachment scanning, or an AI-generated verdict. A low score means that the currently implemented checks found few or no indicators; it does not mean that the email is safe.

## License

License information will be added when the distribution model is finalized.

