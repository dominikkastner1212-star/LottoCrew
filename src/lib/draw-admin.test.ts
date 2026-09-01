import { describe, expect, it } from "vitest";

import { buildDrawCleanupPlan, parseDrawJackpotAmount } from "./draw-admin";

describe("draw admin helpers", () => {
  it("parses German jackpot amounts for draw updates", () => {
    expect(parseDrawJackpotAmount("59.000.000,50")).toBe(59000000.5);
    expect(parseDrawJackpotAmount("59,5")).toBe(59.5);
  });

  it("rejects negative jackpot amounts", () => {
    expect(() => parseDrawJackpotAmount("-1")).toThrow("Jackpot darf nicht negativ sein.");
  });

  it("builds a cleanup plan for deleting a draw and its related records", () => {
    expect(
      buildDrawCleanupPlan({
        tickets: [
          { id: "ticket-1", ticket_image_path: "tickets/ticket-1.pdf" },
          { id: "ticket-2", ticket_image_path: null },
        ],
        winnings: [{ id: "winning-1" }],
      }),
    ).toEqual({
      ticketIds: ["ticket-1", "ticket-2"],
      winningIds: ["winning-1"],
      ticketDocumentPaths: ["tickets/ticket-1.pdf"],
    });
  });
});
