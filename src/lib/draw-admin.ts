export type DrawCleanupTicket = {
  id: string;
  ticket_image_path: string | null;
};

export type DrawCleanupWinning = {
  id: string;
};

export function parseDrawJackpotAmount(value: FormDataEntryValue | string | null) {
  const raw = String(value ?? "").trim();
  const parsed = Number(raw.replace(/\./g, "").replace(",", "."));

  if (!Number.isFinite(parsed)) {
    throw new Error("Bitte einen gültigen Jackpot eintragen.");
  }
  if (parsed < 0) {
    throw new Error("Jackpot darf nicht negativ sein.");
  }

  return parsed;
}

export function buildDrawCleanupPlan({
  tickets,
  winnings,
}: {
  tickets: DrawCleanupTicket[];
  winnings: DrawCleanupWinning[];
}) {
  return {
    ticketIds: tickets.map((ticket) => ticket.id),
    winningIds: winnings.map((winning) => winning.id),
    ticketDocumentPaths: tickets
      .map((ticket) => ticket.ticket_image_path)
      .filter((path): path is string => Boolean(path)),
  };
}
