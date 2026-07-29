import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { GmailProviderAdapter } from "./adapter";

const fixture = readFileSync(resolve(process.cwd(), "src/providers/gmail/fixtures/credential-phishing.html"), "utf8");

function createAdapter(html: string): GmailProviderAdapter {
  const window = new Window();
  window.document.body.innerHTML = html;
  return new GmailProviderAdapter({
    document: window.document as unknown as Document,
    location: { hostname: "mail.google.com", href: "https://mail.google.com/mail/u/0/#inbox/message" },
  });
}

describe("GmailProviderAdapter", () => {
  it("detects an open Gmail message and extracts normalized visible data", async () => {
    const adapter = createAdapter(fixture);
    expect(adapter.isSupportedPage()).toBe(true);
    expect(adapter.isEmailOpen()).toBe(true);
    const message = await adapter.extractCurrentEmail();
    expect(message.provider).toBe("gmail");
    expect(message.subject).toBe("Urgent account verification required");
    expect(message.sender).toEqual({ displayName: "PayPal Security", address: "security@paypa1-support.example" });
    expect(message.recipients).toEqual([{ displayName: "analyst@example.test", address: "analyst@example.test" }]);
    expect(message.bodyText).toContain("Immediate action required.");
    expect(message.links[0]).toMatchObject({ displayText: "https://paypal.com", hostname: "paypa1-support.example", protocol: "https" });
    expect(message.attachments[0]).toMatchObject({ filename: "invoice.pdf.exe", extension: "exe" });
    expect(message.visibleWarnings).toContain("Gmail could not verify that this message was sent by the claimed sender.");
    expect(message.extractionWarnings).toEqual([]);
  });

  it("fails explicitly when no message body can be identified", async () => {
    const adapter = createAdapter("<div role=\"main\"><h2 class=\"hP\">No body</h2></div>");
    expect(adapter.isEmailOpen()).toBe(false);
    await expect(adapter.extractCurrentEmail()).rejects.toThrow("No open Gmail message");
  });

  it("does not report unsupported pages as Gmail", () => {
    const adapter = new GmailProviderAdapter({ document: new Window().document as unknown as Document, location: { hostname: "example.com", href: "https://example.com" } });
    expect(adapter.isSupportedPage()).toBe(false);
    expect(adapter.isEmailOpen()).toBe(false);
  });

  it("highlights extracted links and removes all highlight artifacts", async () => {
    const window = new Window();
    window.document.body.innerHTML = fixture;
    const adapter = new GmailProviderAdapter({
      document: window.document as unknown as Document,
      location: { hostname: "mail.google.com", href: "https://mail.google.com/mail/u/0/#inbox/message" },
    });
    const message = await adapter.extractCurrentEmail();
    const link = window.document.querySelector("[data-phishcheck-id='gmail-link-1']");

    adapter.highlightFinding({ targetElementId: message.links[0]?.id });
    expect(link?.classList.contains("phishcheck-highlight")).toBe(true);
    expect(window.document.getElementById("phishcheck-highlight-style")).not.toBeNull();

    adapter.clearHighlights();
    expect(link?.classList.contains("phishcheck-highlight")).toBe(false);
    expect(window.document.getElementById("phishcheck-highlight-style")).toBeNull();
  });
});