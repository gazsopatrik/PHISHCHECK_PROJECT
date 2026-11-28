// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";

vi.mock("../analysis/engine", () => ({
  analyzeMessage: vi.fn(() => ({
    riskScore: 0, riskLevel: "low", confidenceLevel: "low",
    confidenceScore: 0, summary: "Test analysis", findings: [], limitations: [],
  })),
}));
vi.mock("../rules/brands", () => ({ commonBrands: [] }));

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  vi.resetModules();
});

it("starts a new extraction directly from Analyze Again", async () => {
  let extractions = 0;
  vi.stubGlobal("chrome", {
    runtime: {},
    tabs: {
      query: (_options: unknown, callback: (tabs: unknown[]) => void) =>
        callback([{ id: 1, url: "https://mail.google.com/mail/u/0/#inbox/test" }]),
      sendMessage: (_id: number, message: string, callback: (response: unknown) => void) => {
        if (message === "PHISHCHECK_PING") callback({ ok: true, supported: true });
        else {
          extractions += 1;
          callback({ ok: true, email: {} });
        }
      },
    },
  });
  document.body.innerHTML = '<main id="app"></main>';
  await import("./main");
  document.querySelector<HTMLButtonElement>("button")!.click();
  await vi.waitFor(() => expect(extractions).toBe(1));
  await vi.waitFor(() => expect(document.body.textContent).toContain("Analyze Again"));
  const rerun = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Analyze Again")!;
  rerun.click();
  expect(rerun.disabled).toBe(true);
  await vi.waitFor(() => expect(extractions).toBe(2));
  await vi.waitFor(() => expect(document.body.textContent).toContain("Analyze Again"));
});
