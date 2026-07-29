import { describe, expect, it } from "vitest";
import { analyzeMessage } from "./engine";
import { commonBrands } from "../rules/brands";
import type { EmailMessage } from "../models/email";

const message: EmailMessage = {
  provider: "gmail",
  sender: { displayName: "PayPal Security", address: "security@paypa1-support.example" },
  recipients: [],
  subject: "Verify now",
  bodyText: "Please verify your account.",
  bodyHtml: "<p>Please verify your account.</p>",
  links: [{ id: "link-1", displayText: "https://paypal.com", rawHref: "https://paypa1-support.example/login", normalizedUrl: "https://paypa1-support.example/login", hostname: "paypa1-support.example", protocol: "https", isButton: true, sourceElementDescription: "a" }],
  attachments: [],
  visibleWarnings: [],
  extractedAt: new Date(0).toISOString(),
  extractionWarnings: [],
};

describe("analysis engine", () => {
  it("returns explainable score, risk, confidence, and correlation findings", () => {
    const result = analyzeMessage(message, { brands: commonBrands });
    expect(result.riskScore).toBe(44);
    expect(result.riskLevel).toBe("suspicious");
    expect(result.confidenceLevel).toBe("high");
    expect(result.findings.map((finding) => finding.ruleId)).toContain("CORRELATION_BRAND_SENDER_LINK");
    expect(result.summary).toContain("44/100");
  });

  it("lowers confidence when extraction metadata is missing", () => {
    const result = analyzeMessage({ ...message, sender: null, subject: null, bodyHtml: null, extractionWarnings: ["Body partially hidden.", "Sender metadata unavailable.", "Link extraction was incomplete."] }, { brands: commonBrands });
    expect(result.confidenceLevel).toBe("low");
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});