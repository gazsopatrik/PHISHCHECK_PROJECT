# Opera GX Manual Smoke Test

This checklist is the required manual validation for the Opera GX-first MVP. It must be completed with the generated `dist` directory loaded as an unpacked extension.

## Environment

- [ ] Current supported Opera GX desktop build is installed.
- [ ] A test Gmail account is available.
- [ ] The test account contains no sensitive production email content.
- [ ] The extension was built with `pnpm build`.

## Installation and permissions

- [ ] Open `opera://extensions`.
- [ ] Enable Developer mode.
- [ ] Load the `dist` directory as an unpacked extension.
- [ ] Confirm the extension loads without a service-worker error.
- [ ] Confirm permissions are limited to the documented Manifest V3 permissions.

## Popup and accessibility

- [ ] Open the extension popup in Opera GX.
- [ ] Confirm the PhishCheck header and Opera GX/Gmail provider label are visible.
- [ ] Confirm the popup works at narrow width and with browser zoom increased.
- [ ] Navigate through controls using Tab and Shift+Tab.
- [ ] Confirm every focused control has a visible focus indicator.
- [ ] Confirm severity and risk information are understandable without relying on color alone.
- [ ] Confirm Opera GX dark mode does not reduce contrast.

## Runtime behavior

- [ ] Run the extension on a non-Gmail page and confirm the user sees: “Open an email in Gmail, then run the analysis again.”
- [ ] Run it on Gmail with no email open and confirm the same user-readable message.
- [ ] Open a legitimate marketing fixture email and confirm no fabricated findings appear.
- [ ] Open a phishing-like test email and confirm score, risk level, confidence, evidence, and recommendations render.
- [ ] Confirm extraction failures do not expose raw stack traces.

## Highlighting

- [ ] Click **Highlight Suspicious Content**.
- [ ] Confirm suspicious links and visible attachment elements receive a PhishCheck outline.
- [ ] Confirm the extension does not navigate to a highlighted link.
- [ ] Click **Remove Highlights**.
- [ ] Confirm outlines, attributes, and the injected PhishCheck style are removed.
- [ ] Navigate to another Gmail message and confirm highlights do not persist.

## Result

- [ ] Record pass/fail results and any Opera GX-specific issue in the development log.
- [ ] Do not mark the manual validation complete until all failed checks are resolved or documented as accepted limitations.
