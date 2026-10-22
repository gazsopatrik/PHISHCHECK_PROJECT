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
  it("flags executable link schemes without flagging normal web or email links", () => {
    const links = [
      { ...message.links[0]!, id: "unsafe-js", rawHref: "javascript:alert(1)", normalizedUrl: "javascript:alert(1)", hostname: null, protocol: "javascript" },
      { ...message.links[0]!, id: "unsafe-data", rawHref: "data:text/html,test", normalizedUrl: "data:text/html,test", hostname: null, protocol: "data" },
      { ...message.links[0]!, id: "safe-http", rawHref: "https://example.test", normalizedUrl: "https://example.test/", hostname: "example.test", protocol: "https" },
      { ...message.links[0]!, id: "safe-mail", rawHref: "mailto:help@example.test", normalizedUrl: "mailto:help@example.test", hostname: null, protocol: "mailto" },
    ];
    const findings = runLinkRules({ ...message, links }, context);
    const unsafeFindings = findings.filter((finding) => finding.ruleId === "LINK_UNSAFE_SCHEME");

    expect(unsafeFindings).toHaveLength(2);
    expect(unsafeFindings.map((finding) => finding.targetElementId)).toEqual(["unsafe-js", "unsafe-data"]);
  });

  it("reports brand impersonation with traceable evidence", () => {
    const findings = runSenderRules(message, context);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "SENDER_BRAND_IMPERSONATION", category: "sender" });
    expect(findings[0]?.evidence).toMatchObject({ brand: "PayPal", senderDomain: "paypa1-support.example" });
  });
});