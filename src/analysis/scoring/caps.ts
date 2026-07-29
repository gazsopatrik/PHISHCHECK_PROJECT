import type { FindingCategory } from "../../models/analysis";

export const categoryCaps: Readonly<Record<FindingCategory, number>> = {
  sender: 30,
  links: 40,
  content: 20,
  attachments: 30,
  consistency: 20,
  "missing-information": 20,
};