# PhishCheck

Opera GX-first, privacy-preserving browser extension for analyzing phishing indicators in emails opened in Gmail.

PhishCheck is a defensive security tool. It performs deterministic analysis locally in the browser and explains why an email may be suspicious. It helps users slow down and verify sensitive requests; it does not guarantee that an email is legitimate.

## Project status

The project is in active MVP development.

The primary target is Opera GX for desktop. The implementation uses standard Manifest V3 and WebExtension-compatible APIs so the same build can also support Chrome, Microsoft Edge, Brave, and other compatible Chromium browsers.

## MVP goals

- Detect whether a Gmail message is currently open.
- Extract visible sender, recipient, subject, body, links, attachments, and Gmail warnings.
- Analyze sender identity, destinations, brand impersonation, social-engineering language, attachments, and content consistency.
- Produce a transparent 0–100 risk score and a separate confidence level.
- Show evidence and recommended next actions for every finding.
- Highlight suspicious content inside Gmail without changing the email.
- Process email content locally without opening links or downloading attachments.

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

Opera-specific proprietary APIs are not required. Browser integration is isolated behind a small compatibility layer so security analysis remains browser-independent.

## Development

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
```

The implementation uses strict TypeScript, Vite, Manifest V3, ESLint, Prettier, and Vitest.

## Loading the unpacked extension in Opera GX

1. Open Opera GX.
2. Navigate to `opera://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select the generated `dist` directory.
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

## Scope limitations

The MVP does not provide full email-header authentication results, OCR, QR-code decoding, reputation lookups, automatic link detonation, attachment scanning, or an AI-generated verdict. These capabilities may be added later as explicit, opt-in modules.

## License

License information will be added when the distribution model is finalized.
