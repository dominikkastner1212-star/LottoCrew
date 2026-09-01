type ExistingGroup = {
  id: string;
  monthly_amount?: number | null;
};

export type WorkspaceProvisioningPlan =
  | {
      type: "join";
      groupId: string;
      role: "participant";
      monthlyAmount: null;
    }
  | {
      type: "create";
      groupName: string;
      slug: string;
      role: "admin";
      monthlyAmount: 0;
    };

export function getWorkspaceProvisioningPlan({
  existingGroups,
  userId,
}: {
  existingGroups: ExistingGroup[];
  userId: string;
  metadata: Record<string, unknown>;
}): WorkspaceProvisioningPlan {
  const firstGroup = existingGroups[0];

  if (firstGroup) {
    return {
      type: "join",
      groupId: firstGroup.id,
      role: "participant",
      monthlyAmount: null,
    };
  }

  return {
    type: "create",
    groupName: "LottoCrew",
    slug: `lottocrew-${userId.slice(0, 8)}`,
    role: "admin",
    monthlyAmount: 0,
  };
}
