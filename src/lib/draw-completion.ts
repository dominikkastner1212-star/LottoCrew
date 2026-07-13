export type DrawCompletionItemKey =
  | "draw_created"
  | "tickets_present"
  | "ticket_document_uploaded"
  | "monthly_payments_created"
  | "draw_evaluated"
  | "winnings_checked"
  | "draw_closed";

export type DrawCompletionItem = {
  key: DrawCompletionItemKey;
  label: string;
  done: boolean;
  description: string;
};

export type DrawCompletion = {
  drawId: string;
  canClose: boolean;
  isClosed: boolean;
  missingItems: DrawCompletionItem[];
  items: DrawCompletionItem[];
  paymentSummary: {
    expected: number;
    existing: number;
    open: number;
    paid: number;
  };
};

export type DrawCompletionDraw = {
  id: string;
  date: string;
  status: string;
  closedAt?: string | null;
};

export type DrawCompletionTicket = {
  drawId: string;
  status: string;
  prizeRank?: string | null;
  winnings?: number;
  imagePath?: string | null;
};

export type DrawCompletionPayment = {
  month: string;
  status: "open" | "paid";
};

function monthOf(date: string) {
  return date.slice(0, 7);
}

export function buildDrawCompletion({
  draw,
  tickets,
  payments,
  activeMemberCount,
}: {
  draw: DrawCompletionDraw;
  tickets: DrawCompletionTicket[];
  payments: DrawCompletionPayment[];
  activeMemberCount: number;
}): DrawCompletion {
  const drawMonth = monthOf(draw.date);
  const drawTickets = tickets.filter((ticket) => ticket.drawId === draw.id);
  const monthPayments = payments.filter((payment) => monthOf(payment.month) === drawMonth);
  const openPayments = monthPayments.filter((payment) => payment.status === "open").length;
  const paidPayments = monthPayments.filter((payment) => payment.status === "paid").length;
  const hasTickets = drawTickets.length > 0;
  const hasTicketDocument = drawTickets.some((ticket) => Boolean(ticket.imagePath));
  const paymentsCreated = activeMemberCount > 0 && monthPayments.length >= activeMemberCount;
  const evaluated = draw.status === "evaluated" || drawTickets.every((ticket) => ticket.status === "evaluated");
  const hasOpenWinningAmount = drawTickets.some((ticket) => ticket.prizeRank && (ticket.winnings ?? 0) <= 0);
  const winningsChecked = evaluated && !hasOpenWinningAmount;
  const isClosed = Boolean(draw.closedAt);

  const items: DrawCompletionItem[] = [
    {
      key: "draw_created",
      label: "Ziehung angelegt",
      done: true,
      description: "Datum und Jackpot sind für diese Runde gespeichert.",
    },
    {
      key: "tickets_present",
      label: "Tipps/Kästchen vorhanden",
      done: hasTickets,
      description: hasTickets
        ? `${drawTickets.length} Tipp${drawTickets.length === 1 ? "" : "s"} hängen an dieser Ziehung.`
        : "Es ist noch kein Tipp für diese Ziehung eingetragen.",
    },
    {
      key: "ticket_document_uploaded",
      label: "Spielschein hochgeladen",
      done: hasTicketDocument,
      description: hasTicketDocument
        ? "Mindestens ein Spielschein ist bei einem Tipp hinterlegt."
        : "Lade mindestens einen Spielschein bei einem Tipp dieser Ziehung hoch.",
    },
    {
      key: "monthly_payments_created",
      label: "Monatsbeiträge erzeugt",
      done: paymentsCreated,
      description: paymentsCreated
        ? `${monthPayments.length} Beitrag${monthPayments.length === 1 ? "" : "e"} für den Ziehungsmonat vorhanden, ${paidPayments} bezahlt, ${openPayments} offen.`
        : `Für den Ziehungsmonat fehlen Beiträge. Vorhanden: ${monthPayments.length} von ${activeMemberCount} aktiven Mitgliedern.`,
    },
    {
      key: "draw_evaluated",
      label: "Ziehung ausgewertet",
      done: evaluated,
      description: evaluated ? "Die Ziehung wurde ausgewertet." : "Werte die Ziehung aus, sobald die Zahlen feststehen.",
    },
    {
      key: "winnings_checked",
      label: "Gewinnbetrag geprüft",
      done: winningsChecked,
      description: !evaluated
        ? "Gewinnprüfung offen, solange die Ziehung nicht ausgewertet ist."
        : hasOpenWinningAmount
          ? "Mindestens ein erkannter Gewinn hat noch keinen Betrag."
          : "Gewinnbetrag geprüft oder kein Gewinn vorhanden.",
    },
    {
      key: "draw_closed",
      label: "Runde abgeschlossen",
      done: isClosed,
      description: isClosed ? "Diese Runde wurde abgeschlossen." : "Ein Admin kann die Runde abschließen, sobald alle Pflichtpunkte erledigt sind.",
    },
  ];

  const mandatoryItems = items.filter((item) => item.key !== "draw_closed");
  const missingItems = mandatoryItems.filter((item) => !item.done);

  return {
    drawId: draw.id,
    canClose: !isClosed && missingItems.length === 0,
    isClosed,
    missingItems,
    items,
    paymentSummary: {
      expected: activeMemberCount,
      existing: monthPayments.length,
      open: openPayments,
      paid: paidPayments,
    },
  };
}

export function canCloseDrawForRole({ isAdmin, completion }: { isAdmin: boolean; completion: DrawCompletion }) {
  if (!isAdmin) {
    return { allowed: false, reason: "Nur Admins dürfen eine Runde abschließen." };
  }
  if (completion.isClosed) {
    return { allowed: false, reason: "Diese Runde ist bereits abgeschlossen." };
  }
  if (!completion.canClose) {
    return {
      allowed: false,
      reason: `Vor dem Abschluss fehlt noch: ${completion.missingItems.map((item) => item.label).join(", ")}.`,
    };
  }
  return { allowed: true, reason: "" };
}
