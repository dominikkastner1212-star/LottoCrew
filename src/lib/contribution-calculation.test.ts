import { describe, expect, it } from "vitest";
import { buildMonthlyPaymentRows, calculateMonthlyContribution } from "./contribution-calculation";

describe("monthly contribution calculation", () => {
  it("calculates a normal monthly contribution", () => {
    expect(calculateMonthlyContribution({ activeMemberCount: 8, ticketFieldCount: 20, ticketFieldPrice: 2.5, previousMonthWinnings: 0 })).toMatchObject({
      gameCost: 50,
      distributableAmount: 50,
      contributionPerMember: 6.25,
      paymentAmounts: [6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25, 6.25],
    });
  });

  it("reduces the contribution by previous month winnings", () => {
    expect(calculateMonthlyContribution({ activeMemberCount: 8, ticketFieldCount: 20, ticketFieldPrice: 2.5, previousMonthWinnings: 10 })).toMatchObject({
      gameCost: 50,
      previousMonthWinnings: 10,
      distributableAmount: 40,
      contributionPerMember: 5,
    });
  });

  it("returns zero when previous winnings exceed game cost", () => {
    expect(calculateMonthlyContribution({ activeMemberCount: 8, ticketFieldCount: 2, ticketFieldPrice: 2.5, previousMonthWinnings: 10 })).toMatchObject({
      distributableAmount: 0,
      contributionPerMember: 0,
      paymentAmounts: [0, 0, 0, 0, 0, 0, 0, 0],
    });
  });

  it("does not divide by zero when there are no active members", () => {
    expect(calculateMonthlyContribution({ activeMemberCount: 0, ticketFieldCount: 20, ticketFieldPrice: 2.5, previousMonthWinnings: 10 })).toMatchObject({
      contributionPerMember: 0,
      paymentAmounts: [],
    });
  });

  it("handles a month without tickets", () => {
    expect(calculateMonthlyContribution({ activeMemberCount: 4, ticketFieldCount: 0, ticketFieldPrice: 2.5, previousMonthWinnings: 0 })).toMatchObject({
      gameCost: 0,
      distributableAmount: 0,
      paymentAmounts: [0, 0, 0, 0],
    });
  });

  it("distributes cent rounding differences exactly", () => {
    const result = calculateMonthlyContribution({ activeMemberCount: 3, ticketFieldCount: 1, ticketFieldPrice: 1, previousMonthWinnings: 0 });

    expect(result.paymentAmounts).toEqual([0.34, 0.33, 0.33]);
    expect(result.paymentAmounts.reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(1, 2);
  });

  it("does not create duplicate payment rows for existing member payments", () => {
    const rows = buildMonthlyPaymentRows({
      groupId: "group-1",
      dueMonth: "2026-07",
      members: [{ id: "member-1" }, { id: "member-2" }],
      existingPayments: [{ member_id: "member-1" }],
      paymentAmounts: [5, 5],
    });

    expect(rows).toEqual([
      {
        group_id: "group-1",
        member_id: "member-2",
        due_month: "2026-07-01",
        amount: 5,
        status: "open",
      },
    ]);
  });
});
