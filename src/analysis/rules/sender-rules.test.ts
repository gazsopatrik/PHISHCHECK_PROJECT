import { describe, expect, it } from "vitest";
import type { AnalysisContext } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { runSenderRules } from "./sender-rules";

const context: AnalysisContext = { brands: [] };
const baseMessage: EmailMessage = {
  provider: "gmail",
  sender: null,
  recipients: [],
  subject: "",
  bodyText: "",
  bodyHtml: null,
  links: [],
  attachments: [],
  visibleWarnings: [],
  extractedAt: new Date(0).toISOString(),
  extractionWarnings: [],
};

describe("sender rules", () => {
  it("matches whole brand names without flagging unrelated words", () => {
    const brands: AnalysisContext = {
      brands: [{ name: "Apple", domains: ["apple.com"], keywords: ["apple"] }],
    };
    const unrelated = runSenderRules({
      ...baseMessage,
      sender: { displayName: "Pineapple Farm", address: "team@example.org" },
    }, brands);
    const impersonator = runSenderRules({
      ...baseMessage,
      sender: { displayName: "Apple Support", address: "team@example.org" },
    }, brands);
    const legitimate = runSenderRules({
      ...baseMessage,
      sender: { displayName: "Apple Support", address: "team@apple.com" },
    }, brands);

    expect(unrelated.some((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION")).toBe(false);
    expect(impersonator.some((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION")).toBe(true);
    expect(legitimate.some((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION")).toBe(false);
  });

  it("does not flag authority terms embedded in ordinary words", () => {
    for (const displayName of ["Bankruptcy Clinic", "Administrative Assistant"]) {
      const findings = runSenderRules({
        ...baseMessage,
        sender: { displayName, address: "person@gmail.com" },
      }, context);
      expect(findings.some((finding) => finding.ruleId === "SENDER_FREE_PROVIDER_COMPANY_IDENTITY")).toBe(false);
    }
  });

  it("still flags an explicit company-style identity on a free mailbox", () => {
    const findings = runSenderRules({
      ...baseMessage,
      sender: { displayName: "Bank Support", address: "help@gmail.com" },
    }, context);

    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ ruleId: "SENDER_FREE_PROVIDER_COMPANY_IDENTITY" }),
    ]));
  });
});
