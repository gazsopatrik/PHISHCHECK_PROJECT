import { describe, expect, it } from "vitest";
import { isExtensionRuntimeAvailable } from "./browser-api";

describe("browser API compatibility layer", () => {
  it("does not require extension globals in a unit-test environment", () => {
    expect(isExtensionRuntimeAvailable()).toBe(false);
  });
});