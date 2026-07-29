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