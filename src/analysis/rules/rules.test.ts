import { describe, expect, it } from "vitest";
import type { AnalysisContext } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { commonBrands } from "../../rules/brands";
import { runLinkRules } from "./link-rules";
import { runSenderRules } from "./sender-rules";

const context: AnalysisContext = { brands: commonBrands };
const message: EmailMessage = {
  provider: "gmail",
  sender: { displayName: "PayPal Security", address: "security@paypa1-support.example" },
  recipients: [],
  subject: "Verify now",
  bodyText: "Please verify your account.",
  bodyHtml: null,
  links: [{
    id: "gmail-link-1",
    displayText: "https://paypal.com",
    rawHref: "https://paypa1-support.example/login?redirect=https%3A%2F%2Fevil.example",
    normalizedUrl: "https://paypa1-support.example/login?redirect=https%3A%2F%2Fevil.example",
    hostname: "paypa1-support.example",
    protocol: "https",
    isButton: true,
    sourceElementDescription: "a[role=button]"
  }],
  attachments: [],
  visibleWarnings: [],
  extractedAt: new Date(0).toISOString(),
  extractionWarnings: [],
};

describe("initial deterministic rules", () => {
  it("reports link mismatch and redirect evidence", () => {
    const findings = runLinkRules(message, context);
    expect(findings.map((finding) => finding.ruleId)).toEqual(["LINK_TEXT_DESTINATION_MISMATCH", "LINK_SUSPICIOUS_REDIRECT_PARAMETER"]);
    expect(findings.every((finding) => finding.evidence)).toBe(true);
  });
  it("reports brand impersonation with traceable evidence", () => {
    const findings = runSenderRules(message, context);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "SENDER_BRAND_IMPERSONATION", category: "sender" });
    expect(findings[0]?.evidence).toMatchObject({ brand: "PayPal", senderDomain: "paypa1-support.example" });
  });
});