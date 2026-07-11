import { describe, expect, it } from "vitest";

import type { AppContext } from "./app-data";
import { buildAssistantReport } from "./report-assistant";

function baseApp(overrides: Partial<AppContext> = {}): AppContext {
  return {
    userId: "user-1",
    profile: { id: "profile-1", email: "member@example.com", displayName: "Mitglied", avatarUrl: null },
    group: { id: "group-1", name: "LottoCrew", monthlyAmount: 12, currency: "EUR", inviteCode: "ABC123" },
    membership: { id: "member-1", role: "admin", status: "active", groupId: "group-1", monthlyAmount: 12 },
    isAdmin: true,
    members: [
      {
        id: "member-1",
        profileId: "profile-1",
        name: "Mitglied",
        email: "member@example.com",
        role: "admin",
        status: "active",
        monthlyAmount: 12,
        joinedAt: "2026-07-01",
      },
    ],
    draws: [],
    tickets: [],
    payments: [],
    winnings: [],
    monthlyStats: [],
    totals: { activeMembers: 1, totalStake: 0, openPayments: 0, lastWinnings: 0, totalWinnings: 0 },
    ...overrides,
  };
}

describe("report assistant", () => {
  it("builds a readable summary from existing draw, ticket, payment and winning data", () => {
    const app = baseApp({
      draws: [
        { id: "draw-1", date: "2026-07-17", jackpot: 12000000, status: "submitted", resultNumbers: [], resultEuroNumbers: [] },
      ],
      tickets: [
        {
          id: "ticket-1",
          label: "Freitag",
          status: "submitted",
          drawId: "draw-1",
          date: "2026-07-17",
          numbers: [1, 2, 3, 4, 5],
          euroNumbers: [6, 7],
          stake: 2,
          winnings: 0,
          createdBy: "profile-1",
          createdByName: "Mitglied",
          mainMatches: 0,
          euroMatches: 0,
          prizeRank: null,
          imagePath: null,
          imageUrl: null,
        },
      ],
      payments: [
        { id: "payment-1", memberId: "member-1", member: "Mitglied", month: "2026-07-01", amount: 12, status: "open", paidAt: null },
      ],
      winnings: [{ id: "winning-1", date: "2026-07-10", ticket: "Alt", tippedBy: "Mitglied", amount: 18, perMember: 18, rank: "Gewinnklasse 12" }],
    });

    const report = buildAssistantReport(app, new Date("2026-07-11"));

    expect(report.summary).toContain("Die naechste Eurojackpot-Ziehung ist am");
    expect(report.summary).toContain("1 Tipp");
    expect(report.summary).toContain("1 offene Zahlung");
    expect(report.summary).toContain("Gewinnklasse 12");
  });

  it("flags admin tasks for missing tickets and open win amounts", () => {
    const app = baseApp({
      draws: [{ id: "draw-1", date: "2026-07-11", jackpot: 1000000, status: "submitted", resultNumbers: [], resultEuroNumbers: [] }],
      tickets: [
        {
          id: "ticket-1",
          label: "Treffer",
          status: "evaluated",
          drawId: "draw-1",
          date: "2026-07-11",
          numbers: [1, 2, 3, 4, 5],
          euroNumbers: [1, 2],
          stake: 2,
          winnings: 0,
          createdBy: "profile-1",
          createdByName: "Mitglied",
          mainMatches: 3,
          euroMatches: 1,
          prizeRank: "Gewinnklasse 9",
          imagePath: null,
          imageUrl: null,
        },
      ],
    });

    const report = buildAssistantReport(app, new Date("2026-07-11"));

    expect(report.adminTasks.find((task) => task.title === "Gewinnbetrag nachtragen")).toMatchObject({
      done: false,
      urgent: true,
    });
    expect(report.submittedDraws).toHaveLength(1);
  });

  it("limits member payment hints to the current member", () => {
    const app = baseApp({
      isAdmin: false,
      membership: { id: "member-1", role: "participant", status: "active", groupId: "group-1", monthlyAmount: 12 },
      payments: [
        { id: "payment-own", memberId: "member-1", member: "Mitglied", month: "2026-07-01", amount: 12, status: "open", paidAt: null },
        { id: "payment-other", memberId: "member-2", member: "Andere", month: "2026-07-01", amount: 12, status: "open", paidAt: null },
      ],
    });

    const report = buildAssistantReport(app, new Date("2026-07-11"));

    expect(report.memberOpenPayments.map((payment) => payment.id)).toEqual(["payment-own"]);
    expect(report.memberSummaryItems.find((item) => item.title === "Eigene offene Beitraege")).toMatchObject({
      done: false,
      urgent: true,
    });
  });
});
