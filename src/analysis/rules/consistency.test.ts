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
  it("compares link domains against the domain after a quoted @", () => {
    const sender = { displayName: "Team", address: '"team@billing"@example.com' };
    const related = runConsistencyRules({
      ...baseMessage,
      sender,
      bodyText: "Please review this link.",
      links: [{ ...baseMessage.links[0]!, hostname: "www.example.com" }],
    }, context);
    const unrelated = runConsistencyRules({
      ...baseMessage,
      sender,
      bodyText: "Please review this link.",
    }, context);

    expect(related.some((finding) => finding.ruleId === "CONSISTENCY_UNRELATED_DOMAINS")).toBe(false);
    expect(unrelated.some((finding) => finding.ruleId === "CONSISTENCY_UNRELATED_DOMAINS")).toBe(true);
  });

  it("does not treat a lowercase closing phrase as a personal signature", () => {
    const message = { ...baseMessage, bodyText: "Thank you, payment" };
    const findings = runConsistencyRules(message, context);
    expect(findings.some((finding) => finding.ruleId === "CONSISTENCY_SIGNATURE_MISMATCH")).toBe(false);
  });

  it("reports missing sender, body, and extraction warnings", () => {
    const findings = runMissingInformationRules({ ...baseMessage, sender: null, bodyText: "", extractionWarnings: ["Gmail body was partially hidden."] }, context);
    expect(findings.map((finding) => finding.ruleId)).toEqual(["MISSING_SENDER_ADDRESS", "MISSING_BODY_CONTENT", "EXTRACTION_WARNING:1"]);
  });
});