import { describe, expect, it } from "vitest";
import { hasSuspiciousRedirectParameter, isCommonShortener, isLoginLikeUrl, parseUrl, visibleTextSuggestsDifferentDomain } from "./urls";

describe("URL utilities", () => {
  it("parses malformed and valid URLs without throwing", () => {
    expect(parseUrl("https://example.com/login")).toMatchObject({ hostname: "example.com", protocol: "https", isIp: false });
    expect(parseUrl("not a URL").normalized).toBeNull();
  });

  it("detects login paths, shorteners, and redirect parameters", () => {
    expect(isLoginLikeUrl(parseUrl("https://example.com/account/verify"))).toBe(true);
    expect(isCommonShortener("bit.ly")).toBe(true);
    expect(hasSuspiciousRedirectParameter("https://example.com/?redirect=https%3A%2F%2Fevil.example")).toBe(true);
  });

  it("compares visible and actual domains by registrable domain", () => {
    expect(visibleTextSuggestsDifferentDomain("https://paypal.com", "paypal-security.example")).toBe(true);
    expect(visibleTextSuggestsDifferentDomain("https://login.example.com", "cdn.example.com")).toBe(false);
    expect(visibleTextSuggestsDifferentDomain("WATCH VIDEO", "tracking.example.com")).toBe(false);
  });
});

