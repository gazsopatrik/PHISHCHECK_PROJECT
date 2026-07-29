import type { FindingCategory, SecurityFinding } from "../../models/analysis";
import { categoryCaps } from "./caps";

export interface CategoryScore {
  category: FindingCategory;
  rawScore: number;
  cappedScore: number;
}

export function calculateCategoryScores(findings: readonly SecurityFinding[]): CategoryScore[] {
  return (Object.keys(categoryCaps) as FindingCategory[]).map((category) => {
    const rawScore = findings.filter((finding) => finding.category === category).reduce((total, finding) => total + Math.max(0, finding.scoreContribution), 0);
    return { category, rawScore, cappedScore: Math.min(categoryCaps[category], rawScore) };
  });
}

export function normalizeRiskScore(findings: readonly SecurityFinding[]): number {
  const total = calculateCategoryScores(findings).reduce((sum, score) => sum + score.cappedScore, 0);
  return Math.max(0, Math.min(100, Math.round(total)));
}