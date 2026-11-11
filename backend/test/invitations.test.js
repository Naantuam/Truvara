import { describe, it, expect } from "vitest";
import { grantsAccess, ACCESS_GRANTING } from "../src/services/membershipAccess.js";
import { invitationState, presentMember } from "../src/services/invitationService.js";

describe("membership access", () => {
  it("grants access only to accepted, active memberships", () => {
    expect(grantsAccess({ isActive: true, invitePending: false })).toBe(true);
    expect(grantsAccess({ isActive: true, invitePending: true })).toBe(false);
    expect(grantsAccess({ isActive: false, invitePending: false })).toBe(false);
    expect(grantsAccess(null)).toBe(false);
  });

  it("keeps pre-invitation memberships working (no invitePending column value = accepted)", () => {
    expect(grantsAccess({ isActive: true, invitePending: undefined })).toBe(true);
  });

  it("uses the same rule for list queries", () => {
    expect(ACCESS_GRANTING).toEqual({ isActive: true, invitePending: false });
  });
});

describe("invitationState", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  const later = new Date("2026-11-12T12:00:00Z");
  const earlier = new Date("2026-11-10T12:00:00Z");

  it("is valid while pending and unexpired", () => {
    expect(invitationState({ invitePending: true, inviteExpiresAt: later }, now)).toBe("valid");
  });
  it("is expired after the deadline", () => {
    expect(invitationState({ invitePending: true, inviteExpiresAt: earlier }, now)).toBe("expired");
  });
  it("is invalid once accepted, or when the token matched nothing", () => {
    expect(invitationState({ invitePending: false, inviteExpiresAt: later }, now)).toBe("invalid");
    expect(invitationState(null, now)).toBe("invalid");
  });
});

describe("presentMember", () => {
  const base = {
    isActive: true,
    user: { id: "u1", fullName: "Registered Name", email: "person@example.com" },
    role: { name: "Team Member" },
  };

  it("shows the name the Owner typed while the invite is pending, not the account's name", () => {
    const m = presentMember({ ...base, invitePending: true, invitedName: "Typed Name", invitedAt: new Date() });
    expect(m.fullName).toBe("Typed Name");
    expect(m.status).toBe("invited");
    expect(JSON.stringify(m)).not.toContain("Registered Name");
  });

  it("shows the real name once they've joined", () => {
    const m = presentMember({ ...base, invitePending: false, invitedName: "Typed Name" });
    expect(m.fullName).toBe("Registered Name");
    expect(m.status).toBe("active");
    expect(m).not.toHaveProperty("inviteExpiresAt");
  });

  it("marks suspended members inactive", () => {
    expect(presentMember({ ...base, isActive: false, invitePending: false }).status).toBe("inactive");
  });
});
