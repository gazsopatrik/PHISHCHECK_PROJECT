import { describe, expect, it } from "vitest";
import type { SecurityFinding } from "../../models/analysis";
import { calculateCategoryScores, normalizeRiskScore } from "./score";

function finding(category: SecurityFinding["category"], scoreContribution: number, id: string): SecurityFinding {
  return { id, ruleId: id, category, severity: "medium", scoreContribution, confidence: 0.9, title: id, explanation: id, evidence: {}, recommendation: id };
}

describe("risk scoring", () => {
  it("applies category caps and normalizes to 0-100", () => {
    const findings = [finding("links", 30, "one"), finding("links", 30, "two"), finding("sender", 40, "three")];
    expect(calculateCategoryScores(findings).find((score) => score.category === "links")).toMatchObject({ rawScore: 60, cappedScore: 40 });
    expect(normalizeRiskScore(findings)).toBe(70);
  });
});