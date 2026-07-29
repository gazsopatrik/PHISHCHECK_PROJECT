import { describe, expect, it } from "vitest";
import { domainsMatchOrRelated, getRegistrableDomain, isIpAddress, isPunycodeHostname, levenshteinDistance, normalizeHostname } from "./domains";

describe("domain utilities", () => {
  it("normalizes hostnames and removes a trailing dot", () => {
    expect(normalizeHostname("  Mail.Example.COM. ")).toBe("mail.example.com");
  });
  it("extracts registrable domains without trusting deceptive subdomains", () => {
    expect(getRegistrableDomain("paypal.com.example.org")).toBe("example.org");
    expect(getRegistrableDomain("portal.example.co.uk")).toBe("example.co.uk");
    expect(domainsMatchOrRelated("login.example.com", "cdn.example.com")).toBe(true);
  });
  it("detects IP and punycode domains", () => {
    expect(isIpAddress("192.168.1.1")).toBe(true);
    expect(isIpAddress("256.1.1.1")).toBe(false);
    expect(isPunycodeHostname("xn--pple-43d.example")).toBe(true);
  });
  it("calculates typo distance", () => {
    expect(levenshteinDistance("paypa1.com", "paypal.com")).toBe(1);
  });
});