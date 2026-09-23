import { describe, it, expect } from "vitest";
import { canApproveDecision } from "../src/services/decisionService.js";

describe("canApproveDecision (segregation of duties)", () => {
  it("blocks a non-Owner from approving their own decision", () => {
    const actor = { userId: "u1", role: "Manager" };
    const decision = { creatorId: "u1" };
    expect(canApproveDecision(actor, decision)).toBe(false);
  });

  it("allows a non-Owner to approve someone else's decision", () => {
    const actor = { userId: "u2", role: "Manager" };
    const decision = { creatorId: "u1" };
    expect(canApproveDecision(actor, decision)).toBe(true);
  });

  it("allows Owner to approve their own decision (single-founder exception)", () => {
    const actor = { userId: "u1", role: "Owner" };
    const decision = { creatorId: "u1" };
    expect(canApproveDecision(actor, decision)).toBe(true);
  });

  it("allows Owner to approve someone else's decision", () => {
    const actor = { userId: "u2", role: "Owner" };
    const decision = { creatorId: "u1" };
    expect(canApproveDecision(actor, decision)).toBe(true);
  });
});
