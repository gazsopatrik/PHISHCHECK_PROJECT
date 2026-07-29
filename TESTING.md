# Testing

The project will use Vitest for deterministic unit tests and fixture-based tests for Gmail extraction.

Required coverage includes URL parsing, domain normalization, registrable-domain comparison, punycode, homoglyphs, shorteners, deceptive subdomains, attachment filenames, social-engineering rules, category caps, correlations, missing data, malformed input, and confidence calculation.

Opera GX smoke tests will cover unpacked installation, popup rendering, Gmail detection, content-script messaging, narrow-window layout, keyboard navigation, dark mode, and highlight cleanup.