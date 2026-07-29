import { describe, expect, it } from "vitest";
import type { AnalysisContext } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { runConsistencyRules } from "./consistency-rules";
import { runMissingInformationRules } from "./missing-information-rules";

const context: AnalysisContext = { brands: [] };
const baseMessage: EmailMessage = {
  provider: "gmail",
  sender: { displayName: "Finance Team", address: "finance@example.com" },
  recipients: [],
  subject: "Payment request",
  bodyText: "Please pay today. Regards, Alice Smith",
  bodyHtml: "<p>Please pay today.</p>",
  links: [{ id: "link-1", displayText: "Open invoice", rawHref: "https://billing.example.net/invoice", normalizedUrl: "https://billing.example.net/invoice", hostname: "billing.example.net", protocol: "https", isButton: false, sourceElementDescription: "a" }],
  attachments: [],
  visibleWarnings: [],
  extractedAt: new Date(0).toISOString(),
  extractionWarnings: [],
};

describe("consistency and missing-information rules", () => {
  it("reports a mismatched signature and unrelated link domain", () => {
    const findings = runConsistencyRules(baseMessage, context);
    expect(findings.map((finding) => finding.ruleId)).toEqual(["CONSISTENCY_SIGNATURE_MISMATCH", "CONSISTENCY_UNRELATED_DOMAINS"]);
  });
  it("reports missing sender, body, and extraction warnings", () => {
    const findings = runMissingInformationRules({ ...baseMessage, sender: null, bodyText: "", extractionWarnings: ["Gmail body was partially hidden."] }, context);
    expect(findings.map((finding) => finding.ruleId)).toEqual(["MISSING_SENDER_ADDRESS", "MISSING_BODY_CONTENT", "EXTRACTION_WARNING:1"]);
  });
});