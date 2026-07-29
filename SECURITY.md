# Security

Email content is hostile input. The implementation must treat extracted text, URLs, HTML, filenames, and Gmail DOM attributes as untrusted.

- Never insert email HTML into extension UI without sanitization.
- Never automatically visit extracted URLs.
- Never execute scripts from email content.
- Use strict TypeScript and a restrictive extension CSP.
- Keep permissions limited to the active tab, scripting, local settings, and Gmail host pages.
- Report missing extraction data instead of inventing values.

Opera GX validation must include extension installation, popup isolation, message passing, focus behavior, zoom, dark mode, and Gmail navigation.