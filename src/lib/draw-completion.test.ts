import { describe, expect, it } from "vitest";
import { buildDrawCompletion, canCloseDrawForRole } from "./draw-completion";

const baseDraw = {
  id: "draw-1",
  date: "2026-07-10",
  status: "evaluated",
  closedAt: null,
};

const readyTickets = [
  {
    drawId: "draw-1",
    status: "evaluated",
    prizeRank: null,
    winnings: 0,
    imagePath: "tickets/draw-1.pdf",
  },
];

const readyPayments = [
  { month: "2026-07-01", status: "paid" as const },
  { month: "2026-07-01", status: "open" as const },
];

describe("draw completion", () => {
  it("does not allow closing a draw without tickets", () => {
    const completion = buildDrawCompletion({ draw: baseDraw, tickets: [], payments: readyPayments, activeMemberCount: 2 });

    expect(completion.canClose).toBe(false);
    expect(completion.missingItems.map((item) => item.key)).toContain("tickets_present");
  });

  it("does not allow closing a draw with tickets before evaluation", () => {
    const completion = buildDrawCompletion({
      draw: { ...baseDraw, status: "submitted" },
      tickets: [{ ...readyTickets[0], status: "submitted" }],
      payments: readyPayments,
      activeMemberCount: 2,
    });

    expect(completion.canClose).toBe(false);
    expect(completion.missingItems.map((item) => item.key)).toContain("draw_evaluated");
  });

  it("allows closing an evaluated draw with all required items", () => {
    const completion = buildDrawCompletion({ draw: baseDraw, tickets: readyTickets, payments: readyPayments, activeMemberCount: 2 });

    expect(completion.canClose).toBe(true);
    expect(completion.missingItems).toEqual([]);
  });

  it("marks a closed draw as closed", () => {
    const completion = buildDrawCompletion({
      draw: { ...baseDraw, closedAt: "2026-07-12T10:00:00Z" },
      tickets: readyTickets,
      payments: readyPayments,
      activeMemberCount: 2,
    });

    expect(completion.isClosed).toBe(true);
    expect(completion.items.find((item) => item.key === "draw_closed")).toMatchObject({ done: true });
    expect(completion.canClose).toBe(false);
  });

  it("does not allow non-admins to close a draw", () => {
    const completion = buildDrawCompletion({ draw: baseDraw, tickets: readyTickets, payments: readyPayments, activeMemberCount: 2 });

    expect(canCloseDrawForRole({ isAdmin: false, completion })).toMatchObject({
      allowed: false,
      reason: "Nur Admins dürfen eine Runde abschließen.",
    });
  });

  it("returns understandable missing item hints", () => {
    const completion = buildDrawCompletion({ draw: baseDraw, tickets: readyTickets, payments: [], activeMemberCount: 2 });
    const permission = canCloseDrawForRole({ isAdmin: true, completion });

    expect(permission.allowed).toBe(false);
    expect(permission.reason).toContain("Monatsbeiträge erzeugt");
    expect(completion.missingItems[0]?.description).toContain("fehlen Beiträge");
  });
});
