import { describe, it, expect } from "vitest";
import { describeAction } from "../src/services/dashboardService.js";

describe("describeAction", () => {
  it("narrates a known audit action code", () => {
    expect(describeAction("decision.approved")).toBe("approved a decision");
    expect(describeAction("task.status_changed")).toBe("updated a task");
    expect(describeAction("transaction.created")).toBe("recorded a transaction");
  });

  it("falls back to the raw code for an unknown action", () => {
    expect(describeAction("something.unmapped")).toBe("something.unmapped");
  });
});
