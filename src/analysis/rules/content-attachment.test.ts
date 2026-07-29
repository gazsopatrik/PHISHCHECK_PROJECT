import { describe, expect, it } from "vitest";
import type { AnalysisContext } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { runAttachmentRules } from "./attachment-rules";
import { runContentRules } from "./content-rules";

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

describe("content and attachment rules", () => {
  it("detects multiple social-engineering patterns with evidence", () => {
    const findings = runContentRules({
      ...baseMessage,
      bodyText: "Immediate action required. Send your password and buy gift cards now.",
    }, context);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "CONTENT_URGENCY",
      "CONTENT_CREDENTIAL_REQUEST",
      "CONTENT_GIFT_CARD_REQUEST",
    ]);
    expect(findings.every((finding) => typeof finding.evidence.matchedText === "string")).toBe(true);
    expect(findings.every((finding) => finding.targetElementId === "gmail-message-body")).toBe(true);
  });

  it("does not treat ordinary account notifications as credential requests", () => {
    const findings = runContentRules({ ...baseMessage, bodyText: "Your account statement is ready. Review it when convenient." }, context);
    expect(findings).toHaveLength(0);
  });

  it("detects manipulative adult-content spam lures", () => {
    const findings = runContentRules({
      ...baseMessage,
      bodyText: "A hypnotic sex technique helped thousands of men last longer in as little as 21 days.",
    }, context);

    expect(findings.map((finding) => finding.ruleId)).toEqual(expect.arrayContaining([
      "CONTENT_ADULT_SCAM_LURE",
      "CONTENT_UNVERIFIABLE_PROMISE",
    ]));
  });

  it("detects obfuscated adult spam wording", () => {
    const findings = runContentRules({
      ...baseMessage,
      bodyText: "Learn how to correctly pleasure a woman's vag1na.",
    }, context);

    expect(findings.map((finding) => finding.ruleId)).toEqual(expect.arrayContaining([
      "CONTENT_ADULT_SCAM_LURE",
      "CONTENT_OBFUSCATED_WORDING",
    ]));
  });

  it("does not turn ordinary urgency into a high score by itself", () => {
    const findings = runContentRules({ ...baseMessage, bodyText: "Please review this urgent project update." }, context);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: "CONTENT_URGENCY", severity: "low", scoreContribution: 5 });
  });

  it("detects executable, double-extension, macro, and archive metadata", () => {
    const findings = runAttachmentRules({
      ...baseMessage,
      attachments: [
        { id: "a1", filename: "invoice.pdf.exe", extension: "exe", displayedSize: null },
        { id: "a2", filename: "report.xlsm", extension: "xlsm", displayedSize: null },
        { id: "a3", filename: "photos.zip", extension: "zip", displayedSize: null },
      ],
    }, context);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "ATTACHMENT_EXECUTABLE",
      "ATTACHMENT_DOUBLE_EXTENSION",
      "ATTACHMENT_MACRO_DOCUMENT",
      "ATTACHMENT_ARCHIVE",
    ]);
  });
});

