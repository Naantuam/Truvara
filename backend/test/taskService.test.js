import { describe, it, expect } from "vitest";
import { canEditTask } from "../src/services/taskService.js";

describe("canEditTask (Responsibility scoping)", () => {
  it("blocks a Team Member from editing a task assigned to someone else", () => {
    const actor = { userId: "u1", permissions: new Set(["operations:task:edit"]) };
    const task = { assigneeId: "u2" };
    expect(canEditTask(actor, task)).toBe(false);
  });

  it("allows a Team Member to edit a task assigned to themselves", () => {
    const actor = { userId: "u1", permissions: new Set(["operations:task:edit"]) };
    const task = { assigneeId: "u1" };
    expect(canEditTask(actor, task)).toBe(true);
  });

  it("allows a Manager/Owner (operations:task:assign) to edit any task", () => {
    const actor = { userId: "u1", permissions: new Set(["operations:task:edit", "operations:task:assign"]) };
    const task = { assigneeId: "u2" };
    expect(canEditTask(actor, task)).toBe(true);
  });
});
