# Scoring and Confidence

Risk and confidence are separate values.

## Category caps

| Category | Maximum contribution |
| --- | ---: |
| Sender | 30 |
| Links | 40 |
| Content | 20 |
| Attachments | 30 |
| Consistency | 20 |
| Missing information | 20 |

Findings are summed within each category and then capped. The capped category values are summed and normalized to 0–100. Every contribution remains visible on its finding.

## Risk levels

- 0–19: Low
- 20–39: Caution
- 40–59: Suspicious
- 60–79: High
- 80–100: Critical

## Confidence

Confidence is reduced when sender metadata, subject, body HTML, or extraction reliability is missing. Extraction warnings are surfaced as limitations. The result may therefore be “high risk, medium confidence”; the two values must never be conflated.

## Correlation

The first correlation combines a known-brand sender impersonation finding with a link destination mismatch. It adds a consistency finding with its own evidence and recommendation. Correlations are bounded by category caps.
