# PhishCheck

Opera GX-first, privacy-preserving browser extension for analyzing phishing indicators in emails opened in Gmail.

PhishCheck is a defensive security tool. It performs deterministic analysis locally in the browser and explains why an email may be suspicious. It is designed to help users slow down and verify sensitive requests; it does not guarantee that an email is legitimate.

## Project status

The project is in active MVP development.

The primary target is Opera GX for desktop. The implementation uses standard Manifest V3 and WebExtension-compatible APIs so that the same build can also support Chrome, Microsoft Edge, Brave, and other compatible Chromium browsers.

## MVP goals

The MVP will:

- detect whether a Gmail message is currently open;
- extract visible sender, recipient, subject, body, links, attachments, and Gmail warnings;
- analyze sender identity, destinations, brand impersonation, social-engineering language, attachments, and content consistency;
- produce a transparent 0–100 risk score;
- report confidence separately from risk;
- show evidence and recommended next actions for every finding;
- highlight suspicious content inside Gmail without changing the email;
- process email content locally;
- avoid opening links, downloading attachments, sending email, or submitting forms.

PhishCheck will never claim that an email is “100% safe”.

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

Opera-specific proprietary APIs are not required. Browser integration is isolated behind a small compatibility layer so the security analysis remains browser-independent.

## Planned architecture

```text
src/
├── background/       Extension service worker and message routing
├── content/          Gmail content script and highlighting
├── popup/            User interface
├── providers/gmail/  Gmail DOM extraction adapter
├── analysis/         Deterministic security rules and scoring
├── models/           Shared TypeScript data models
├── rules/            Rule definitions and brand data
├── storage/          Privacy-preserving local settings
├── ui/               Reusable UI components and accessibility
├── utils/            URL, domain, encoding, and security utilities
└── tests/            Unit, integration, and Gmail fixture tests
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

The project will use:

- TypeScript with strict checking;
- Vite;
- Manifest V3;
- React or lightweight TypeScript UI;
- ESLint and Prettier;
- Vitest or Jest;
- browser-compatible DOM APIs.

Planned commands:

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

The exact scripts will be added with the Phase 1 project foundation.

## Loading the unpacked extension

After a production build:

1. Open Opera GX.
2. Navigate to `opera://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select the generated extension directory.
6. Open Gmail, open an email, and launch PhishCheck from the extension toolbar.

The installation and smoke-test procedure will be documented in more detail before the MVP release.

## Documentation

- [Project specification](./PhishCheck_Project_Specification.md)
- [Development log](./docs/DEVELOPMENT_LOG.md)
- [Architecture](./ARCHITECTURE.md) — to be added in Phase 1
- [Rules](./RULES.md) — to be added with the analysis engine
- [Privacy](./PRIVACY.md) — to be added before the first release
- [Security](./SECURITY.md) — to be added before the first release
- [Testing](./TESTING.md) — to be added with the test foundation

## Scope limitations

The MVP does not provide full email-header authentication results, OCR, QR-code decoding, reputation lookups, automatic link detonation, attachment scanning, or an AI-generated verdict. These capabilities may be added later as explicit, opt-in modules.

## License

License information will be added when the repository's distribution model is finalized.
