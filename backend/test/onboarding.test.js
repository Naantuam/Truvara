import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { applyStep, parseStep, currencyForCountry, STEP_ORDER } from "../src/services/onboardingService.js";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-secret";
});

describe("parseStep", () => {
  it("accepts partial answers and 'not sure'", () => {
    expect(parseStep("registration", { status: "not_sure" })).toEqual({ status: "not_sure" });
    expect(parseStep("identity", {})).toEqual({});
  });

  it("strips fields outside the allowlist", () => {
    expect(parseStep("tax", { filesTaxes: "need_advice", isAdmin: true })).toEqual({ filesTaxes: "need_advice" });
  });

  it("rejects values outside the allowed options", () => {
    expect(() => parseStep("workforce", { staffBand: "a lot" })).toThrow(/staffBand/);
  });

  it("rejects unknown steps", () => {
    expect(() => parseStep("documents", {})).toThrow(/Unknown onboarding step/);
  });
});

describe("applyStep", () => {
  it("merges one step without touching the others", () => {
    const before = { answers: { identity: { tradingName: "Acme" } }, completedSteps: ["identity"] };
    const after = applyStep(before, "industry", { primaryIndustry: "Retail" }, false);
    expect(after.answers).toEqual({ identity: { tradingName: "Acme" }, industry: { primaryIndustry: "Retail" } });
    expect(after.completedSteps).toEqual(["identity"]);
  });

  it("records completion in wizard order, once", () => {
    let p = applyStep(null, "tax", {}, true);
    p = applyStep(p, "identity", {}, true);
    p = applyStep(p, "identity", {}, true);
    expect(p.completedSteps).toEqual(["identity", "tax"]);
    expect(STEP_ORDER[0]).toBe("identity");
  });
});

describe("currencyForCountry", () => {
  it("maps release countries", () => {
    expect(currencyForCountry("NG")).toBe("NGN");
    expect(currencyForCountry("US")).toBe("USD");
  });
});

describe("token purposes", () => {
  it("won't accept a company-picking token for onboarding, or a full session for either", async () => {
    const { verifyIdentityToken, TOKEN_PURPOSE } = await import("../src/services/authService.js");
    const secret = process.env.JWT_ACCESS_SECRET;
    const selectToken = jwt.sign({ sub: "u1", purpose: TOKEN_PURPOSE.SELECT_COMPANY }, secret);
    const onboardingToken = jwt.sign({ sub: "u1", purpose: TOKEN_PURPOSE.ONBOARDING }, secret);
    const session = jwt.sign({ sub: "u1", company_id: "c1" }, secret);

    expect(verifyIdentityToken(onboardingToken, TOKEN_PURPOSE.ONBOARDING)).toBe("u1");
    expect(() => verifyIdentityToken(selectToken, TOKEN_PURPOSE.ONBOARDING)).toThrow();
    expect(() => verifyIdentityToken(onboardingToken, TOKEN_PURPOSE.SELECT_COMPANY)).toThrow();
    expect(() => verifyIdentityToken(session, TOKEN_PURPOSE.ONBOARDING)).toThrow();
  });
});

