export type ContributionInput = {
  activeMemberCount: number;
  ticketFieldCount: number;
  ticketFieldPrice: number;
  previousMonthWinnings: number;
};

export type ContributionCalculation = {
  activeMemberCount: number;
  ticketFieldCount: number;
  ticketFieldPrice: number;
  gameCost: number;
  previousMonthWinnings: number;
  distributableAmount: number;
  contributionPerMember: number;
  paymentAmounts: number[];
};

export type MonthlyPaymentMember = {
  id: string;
};

export type ExistingMonthlyPayment = {
  member_id: string;
};

function toCents(value: number) {
  return Math.max(0, Math.round(value * 100));
}

function fromCents(value: number) {
  return value / 100;
}

export function calculateMonthlyContribution(input: ContributionInput): ContributionCalculation {
  const activeMemberCount = Math.max(0, Math.trunc(input.activeMemberCount));
  const ticketFieldCount = Math.max(0, Math.trunc(input.ticketFieldCount));
  const ticketFieldPriceCents = toCents(input.ticketFieldPrice);
  const previousMonthWinningsCents = toCents(input.previousMonthWinnings);
  const gameCostCents = ticketFieldCount * ticketFieldPriceCents;
  const distributableCents = Math.max(0, gameCostCents - previousMonthWinningsCents);

  if (activeMemberCount === 0) {
    return {
      activeMemberCount,
      ticketFieldCount,
      ticketFieldPrice: fromCents(ticketFieldPriceCents),
      gameCost: fromCents(gameCostCents),
      previousMonthWinnings: fromCents(previousMonthWinningsCents),
      distributableAmount: fromCents(distributableCents),
      contributionPerMember: 0,
      paymentAmounts: [],
    };
  }

  const baseCents = Math.floor(distributableCents / activeMemberCount);
  const remainder = distributableCents % activeMemberCount;
  const paymentAmounts = Array.from({ length: activeMemberCount }, (_, index) => fromCents(baseCents + (index < remainder ? 1 : 0)));

  return {
    activeMemberCount,
    ticketFieldCount,
    ticketFieldPrice: fromCents(ticketFieldPriceCents),
    gameCost: fromCents(gameCostCents),
    previousMonthWinnings: fromCents(previousMonthWinningsCents),
    distributableAmount: fromCents(distributableCents),
    contributionPerMember: fromCents(baseCents),
    paymentAmounts,
  };
}

export function buildMonthlyPaymentRows({
  groupId,
  dueMonth,
  members,
  existingPayments,
  paymentAmounts,
}: {
  groupId: string;
  dueMonth: string;
  members: MonthlyPaymentMember[];
  existingPayments: ExistingMonthlyPayment[];
  paymentAmounts: number[];
}) {
  const existingMemberIds = new Set(existingPayments.map((payment) => payment.member_id));

  return members
    .map((member, index) => ({
      group_id: groupId,
      member_id: member.id,
      due_month: `${dueMonth}-01`,
      amount: paymentAmounts[index] ?? 0,
      status: "open",
    }))
    .filter((payment) => !existingMemberIds.has(payment.member_id));
}
