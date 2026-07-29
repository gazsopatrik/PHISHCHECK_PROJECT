# Analysis Rules

Rules will be deterministic, independently testable, and traceable to a documented score contribution.

Initial rule groups:

- sender identity and domain mismatch;
- link destination mismatch, IP URLs, HTTP login pages, shorteners, punycode, and deceptive subdomains;
- brand impersonation and typosquatting;
- urgency, credential requests, financial pressure, gift-card requests, and remote-access requests;
- executable, macro-enabled, archive, and double-extension attachments;
- signature, recipient, sender-domain, and referenced-domain consistency.

Urgency alone must not create a high-risk verdict. Correlation rules will combine independent evidence while respecting category caps.

## Implemented Phase 3 rules

The first browser-independent rule modules are now available:

- link text versus destination mismatch;
- IP-address destinations;
- HTTP login or account URLs;
- punycode destinations;
- common URL shorteners;
- suspicious redirect parameters;
- sender punycode domains;
- sender names that reference known brands from unrelated domains;
- company-style identities using common free mailbox providers.

All findings include a rule ID, category, severity, score contribution, confidence, evidence, recommendation, and an optional target element ID.

The registrable-domain helper currently includes a small explicit multi-label suffix set. A maintained public-suffix data strategy is required before treating this as complete for global production use.

## Implemented Phase 5 rules

### Content and social engineering

- urgency and account-consequence pressure;
- credential, password, login, and authentication-code requests;
- financial action requests;
- gift-card and voucher-code requests;
- remote-access, software-installation, and macro-enablement requests.

Urgency is intentionally low severity by itself. Stronger content patterns receive higher contributions and remain bounded by the content category cap.

### Attachments

- executable and script extensions;
- double extensions such as `invoice.pdf.exe`;
- macro-enabled Office documents;
- archives such as ZIP, RAR, and 7Z.

The attachment rules inspect visible metadata only. They never download, open, extract, or execute attachments.

## Implemented Phase 6 rules

- signature name versus visible sender mismatch;
- sender domain versus visible link domain inconsistency;
- missing sender address;
- missing message body;
- explicit extraction-warning findings.

Unrelated domains are treated as a caution signal rather than proof of phishing because legitimate mailing providers and SaaS services may use separate domains.
