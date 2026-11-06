import { describe, expect, it } from "vitest";
import { matchesAnalyzedTab } from "./tab-context";

describe("analyzed tab matching", () => {
  const analyzed = { id: 7, url: "https://mail.google.com/mail/u/0/#inbox/message-1" };

  it("allows highlighting the same Gmail message", () => {
    expect(matchesAnalyzedTab(analyzed, { ...analyzed })).toBe(true);
  });

  it("rejects another tab or a later message in the same tab", () => {
    expect(matchesAnalyzedTab(analyzed, { id: 8, url: analyzed.url })).toBe(false);
    expect(matchesAnalyzedTab(analyzed, { id: 7, url: "https://mail.google.com/mail/u/0/#inbox/message-2" })).toBe(false);
    expect(matchesAnalyzedTab(analyzed, undefined)).toBe(false);
  });

  it("uses the tab ID when Chrome does not provide the original URL", () => {
    expect(matchesAnalyzedTab({ id: 7 }, { id: 7 })).toBe(true);
  });
});
