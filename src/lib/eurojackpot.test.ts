import { describe, expect, it, vi } from "vitest";
import {
  buildEurojackpotResultUrl,
  countMatches,
  evaluateTicketsForDraw,
  fetchEurojackpotResult,
  getEurojackpotPrizeRank,
} from "./eurojackpot";

describe("eurojackpot helpers", () => {
  it("counts matching main and euro numbers", () => {
    expect(countMatches([1, 2, 3, 4, 5], [5, 6, 7, 2, 1])).toBe(3);
  });

  it("maps Eurojackpot hits to prize classes", () => {
    expect(getEurojackpotPrizeRank(5, 2)).toEqual({ key: "5+2", label: "Gewinnklasse 1" });
    expect(getEurojackpotPrizeRank(2, 1)).toEqual({ key: "2+1", label: "Gewinnklasse 12" });
    expect(getEurojackpotPrizeRank(2, 0)).toBeNull();
  });

  it("requires a configured API URL before fetching results", async () => {
    await expect(fetchEurojackpotResult("2026-07-10", vi.fn())).rejects.toThrow(
      "EUROJACKPOT_RESULTS_API_URL ist nicht gesetzt.",
    );
  });

  it("builds result URLs from either a date placeholder or query parameter", () => {
    expect(buildEurojackpotResultUrl("https://example.test/results/{date}", "2026-07-10")).toBe(
      "https://example.test/results/2026-07-10",
    );
    expect(buildEurojackpotResultUrl("https://example.test/results", "2026-07-10")).toBe(
      "https://example.test/results?date=2026-07-10",
    );
  });

  it("does not create auto winnings for tickets with manual winnings", () => {
    const result = {
      drawDate: "2026-07-10",
      numbers: [1, 2, 3, 4, 5],
      euroNumbers: [6, 7],
      prizeAmounts: new Map([["5+2", 120.5]]),
    };

    const plan = evaluateTicketsForDraw(
      [
        { id: "manual-ticket", numbers: [1, 2, 3, 4, 5], euroNumbers: [6, 7] },
        { id: "auto-ticket", numbers: [1, 2, 3, 4, 5], euroNumbers: [6, 7] },
      ],
      result,
      new Set(["manual-ticket"]),
    );

    expect(plan.ticketEvaluations).toHaveLength(2);
    expect(plan.autoWinningDrafts).toEqual([
      {
        ticketId: "auto-ticket",
        amount: 120.5,
        mainMatches: 5,
        euroMatches: 2,
        prizeKey: "5+2",
        prizeRank: "Gewinnklasse 1",
      },
    ]);
  });

  it("keeps auto winning amount at zero when the API has no prize amount", () => {
    const plan = evaluateTicketsForDraw(
      [{ id: "ticket-1", numbers: [1, 2, 3, 4, 5], euroNumbers: [6, 7] }],
      { drawDate: "2026-07-10", numbers: [1, 2, 3, 4, 5], euroNumbers: [6, 7] },
      new Set(),
    );

    expect(plan.autoWinningDrafts[0]?.amount).toBe(0);
  });
});
