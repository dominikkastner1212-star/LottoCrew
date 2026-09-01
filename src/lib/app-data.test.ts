import { describe, expect, it } from "vitest";
import { getWorkspaceProvisioningPlan } from "./workspace-provisioning";

describe("workspace provisioning", () => {
  it("joins the existing LottoCrew group as participant without a preset amount", () => {
    expect(
      getWorkspaceProvisioningPlan({
        existingGroups: [{ id: "group-1", monthly_amount: 24 }],
        userId: "user-1",
        metadata: {},
      }),
    ).toEqual({
      type: "join",
      groupId: "group-1",
      role: "participant",
      monthlyAmount: null,
    });
  });

  it("creates the first internal group with zero fallback amount", () => {
    expect(
      getWorkspaceProvisioningPlan({
        existingGroups: [],
        userId: "12345678-0000-0000-0000-000000000000",
        metadata: {},
      }),
    ).toMatchObject({
      type: "create",
      groupName: "LottoCrew",
      slug: "lottocrew-12345678",
      role: "admin",
      monthlyAmount: 0,
    });
  });
});
