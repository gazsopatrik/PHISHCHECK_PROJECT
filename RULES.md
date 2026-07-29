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
