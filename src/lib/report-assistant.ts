import type { AppContext, AppDraw, AppPayment, AppTicket, AppWinning } from "./app-data";
import { formatCurrency, formatDate } from "./utils";

export type AssistantTask = {
  title: string;
  detail: string;
  href: string;
  done: boolean;
  urgent?: boolean;
};

export type AssistantMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AssistantReport = {
  nextDraw: AppDraw | null;
  nextDrawTickets: AppTicket[];
  openPayments: AppPayment[];
  memberOpenPayments: AppPayment[];
  unevaluatedDraws: AppDraw[];
  submittedDraws: AppDraw[];
  openAmountTickets: AppTicket[];
  lastEvaluatedDraw: AppDraw | null;
  lastWinning: AppWinning | null;
  adminTasks: AssistantTask[];
  memberSummaryItems: AssistantTask[];
  metrics: AssistantMetric[];
  adminFocus: string;
  summary: string;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function sameOrAfter(date: string, reference: Date) {
  return startOfDay(new Date(date)).getTime() >= startOfDay(reference).getTime();
}

function sameOrBefore(date: string, reference: Date) {
  return startOfDay(new Date(date)).getTime() <= startOfDay(reference).getTime();
}

function plural(count: number, singular: string, pluralLabel = `${singular}e`) {
  return `${count} ${count === 1 ? singular : pluralLabel}`;
}

function getNextDraw(draws: AppDraw[], today: Date) {
  return (
    draws.find((draw) => draw.status !== "evaluated" && sameOrAfter(draw.date, today)) ??
    draws.find((draw) => draw.status !== "evaluated") ??
    null
  );
}

function getImportantAdminFocus(tasks: AssistantTask[]) {
  const urgent = tasks.find((task) => !task.done && task.urgent);
  if (urgent) {
    return urgent.title;
  }
  const open = tasks.find((task) => !task.done);
  return open?.title ?? "Alles Wichtige ist erledigt";
}

export function buildAssistantReport(app: AppContext, today = new Date()): AssistantReport {
  const nextDraw = getNextDraw(app.draws, today);
  const nextDrawTickets = nextDraw ? app.tickets.filter((ticket) => ticket.drawId === nextDraw.id) : [];
  const openPayments = app.payments.filter((payment) => payment.status === "open");
  const memberOpenPayments = app.membership
    ? openPayments.filter((payment) => payment.memberId === app.membership?.id)
    : [];
  const submittedDraws = app.draws.filter((draw) => draw.status === "submitted");
  const unevaluatedDraws = app.draws.filter((draw) => draw.status !== "evaluated" && sameOrBefore(draw.date, today));
  const unclosedPastDraws = app.draws.filter((draw) => !draw.closedAt && draw.status === "evaluated" && sameOrBefore(draw.date, today));
  const openAmountTickets = app.tickets.filter((ticket) => ticket.prizeRank && ticket.winnings <= 0);
  const lastEvaluatedDraw = app.draws.find((draw) => draw.status === "evaluated") ?? null;
  const lastWinning = app.winnings[0] ?? null;
  const activeMemberCount = app.members.filter((member) => member.status === "active").length;
  const currentMonth = today.toISOString().slice(0, 7);
  const currentMonthPayments = app.payments.filter((payment) => payment.month.slice(0, 7) === currentMonth);
  const openPaymentAmount = openPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const ownActiveTickets = app.profile
    ? app.tickets.filter((ticket) => ticket.createdBy === app.profile?.id && ticket.status !== "evaluated")
    : [];
  const visibleActiveTickets = app.tickets.filter((ticket) => ticket.status !== "evaluated");

  const adminTasks: AssistantTask[] = [
    {
      title: "Zukünftige Ziehung anlegen",
      detail: nextDraw ? `Nächste Ziehung: ${formatDate(nextDraw.date)}.` : "Es gibt aktuell keine offene zukünftige Ziehung.",
      href: "/ziehungen",
      done: Boolean(nextDraw),
      urgent: !nextDraw,
    },
    {
      title: "Tipps für die nächste Ziehung prüfen",
      detail: nextDraw ? `${plural(nextDrawTickets.length, "Tipp", "Tipps")} für diese Ziehung.` : "Erst eine Ziehung anlegen.",
      href: "/tipps",
      done: nextDrawTickets.length > 0,
      urgent: Boolean(nextDraw) && nextDrawTickets.length === 0,
    },
    {
      title: "Monatsbeiträge erzeugen",
      detail:
        currentMonthPayments.length >= activeMemberCount && activeMemberCount > 0
          ? "Für alle aktiven Mitglieder sind Beiträge im aktuellen Monat vorhanden."
          : `${currentMonthPayments.length} von ${activeMemberCount} Beiträgen für diesen Monat vorhanden.`,
      href: "/kasse",
      done: activeMemberCount > 0 && currentMonthPayments.length >= activeMemberCount,
      urgent: activeMemberCount > 0 && currentMonthPayments.length === 0,
    },
    {
      title: "Offene Zahlungen prüfen",
      detail:
        openPayments.length === 0
          ? "Keine offenen Beiträge."
          : `${plural(openPayments.length, "Zahlung", "Zahlungen")} offen, zusammen ${formatCurrency(openPaymentAmount)}.`,
      href: "/kasse",
      done: openPayments.length === 0,
      urgent: openPayments.length > 0,
    },
    {
      title: "Ziehungen auswerten",
      detail:
        submittedDraws.length === 0
          ? "Keine abgegebene Ziehung wartet auf Auswertung."
          : `${plural(submittedDraws.length, "Ziehung", "Ziehungen")} mit Status abgegeben.`,
      href: "/ziehungen",
      done: submittedDraws.length === 0,
      urgent: submittedDraws.length > 0,
    },
    {
      title: "Gewinnbetrag nachtragen",
      detail:
        openAmountTickets.length === 0
          ? "Keine erkannten Gewinne mit offenem Betrag."
          : `${plural(openAmountTickets.length, "Gewinn", "Gewinne")} brauchen noch einen Betrag.`,
      href: "/kasse",
      done: openAmountTickets.length === 0,
      urgent: openAmountTickets.length > 0,
    },
    {
      title: "Runde abschließen",
      detail:
        unclosedPastDraws.length === 0
          ? "Keine ausgewertete Runde wartet auf Abschluss."
          : `${plural(unclosedPastDraws.length, "ausgewertete Runde", "ausgewertete Runden")} noch nicht abgeschlossen.`,
      href: "/ziehungen",
      done: unclosedPastDraws.length === 0,
      urgent: unclosedPastDraws.length > 0,
    },
  ];

  const memberSummaryItems: AssistantTask[] = [
    {
      title: "Nächste Ziehung",
      detail: nextDraw ? `${formatDate(nextDraw.date)} mit ${plural(nextDrawTickets.length, "Tipp", "Tipps")}.` : "Noch keine offene Ziehung vorhanden.",
      href: "/ziehungen",
      done: Boolean(nextDraw),
    },
    {
      title: "Eigene offene Beiträge",
      detail:
        memberOpenPayments.length === 0
          ? "Für dich sind keine offenen Beiträge sichtbar."
          : `${plural(memberOpenPayments.length, "Beitrag", "Beiträge")} offen.`,
      href: "/kasse",
      done: memberOpenPayments.length === 0,
      urgent: memberOpenPayments.length > 0,
    },
    {
      title: "Aktive Tipps",
      detail:
        ownActiveTickets.length > 0
          ? `${plural(ownActiveTickets.length, "eigener aktiver Tipp", "eigene aktive Tipps")}.`
          : `${plural(visibleActiveTickets.length, "aktiver sichtbarer Tipp", "aktive sichtbare Tipps")}.`,
      href: "/tipps",
      done: visibleActiveTickets.length > 0,
    },
    {
      title: "Letzte Auswertung",
      detail: lastEvaluatedDraw ? `Zuletzt ausgewertet: ${formatDate(lastEvaluatedDraw.date)}.` : "Noch keine Ziehung ausgewertet.",
      href: "/ziehungen",
      done: Boolean(lastEvaluatedDraw),
    },
    {
      title: "Letzter Gewinn",
      detail: lastWinning ? `${lastWinning.rank}: ${formatCurrency(lastWinning.amount)}.` : "Noch kein Gewinn erfasst.",
      href: "/kasse",
      done: Boolean(lastWinning),
    },
  ];

  const lastWinningText = lastWinning
    ? `Der letzte erfasste Gewinn ist ${lastWinning.rank} mit ${formatCurrency(lastWinning.amount)}.`
    : "Bisher ist kein Gewinn erfasst.";
  const nextDrawText = nextDraw
    ? `Die nächste Eurojackpot-Ziehung ist am ${formatDate(nextDraw.date)}. Für diese Ziehung sind aktuell ${plural(nextDrawTickets.length, "Tipp", "Tipps")} eingetragen.`
    : "Aktuell ist keine offene Eurojackpot-Ziehung angelegt.";
  const paymentText =
    openPayments.length > 0
      ? `Es gibt noch ${plural(openPayments.length, "offene Zahlung", "offene Zahlungen")} mit insgesamt ${formatCurrency(openPaymentAmount)}.`
      : "Es gibt keine offenen Zahlungen.";
  const evaluationText =
    submittedDraws.length > 0
      ? `${plural(submittedDraws.length, "Ziehung wartet", "Ziehungen warten")} noch auf die manuelle Auswertung.`
      : "Es wartet keine abgegebene Ziehung auf Auswertung.";

  const adminFocus = getImportantAdminFocus(adminTasks);

  return {
    nextDraw,
    nextDrawTickets,
    openPayments,
    memberOpenPayments,
    unevaluatedDraws,
    submittedDraws,
    openAmountTickets,
    lastEvaluatedDraw,
    lastWinning,
    adminTasks,
    memberSummaryItems,
    adminFocus,
    summary: `${nextDrawText} ${paymentText} ${evaluationText} ${lastWinningText}`,
    metrics: [
      {
        label: "Nächste Ziehung",
        value: nextDraw ? formatDate(nextDraw.date) : "keine",
        detail: nextDraw ? `${plural(nextDrawTickets.length, "Tipp", "Tipps")} eingetragen` : "Bitte Ziehung anlegen",
      },
      {
        label: "Offene Beiträge",
        value: formatCurrency(openPaymentAmount),
        detail: `${plural(openPayments.length, "Zahlung", "Zahlungen")} offen`,
      },
      {
        label: "Auswertung offen",
        value: `${submittedDraws.length}`,
        detail: `${unevaluatedDraws.length} fällige offene Ziehung${unevaluatedDraws.length === 1 ? "" : "en"}`,
      },
      {
        label: "Letzter Gewinn",
        value: lastWinning ? formatCurrency(lastWinning.amount) : "keiner",
        detail: lastWinning?.rank ?? "Noch kein Gewinn erfasst",
      },
      {
        label: "Admin-Fokus",
        value: adminTasks.filter((task) => !task.done).length.toString(),
        detail: adminFocus,
      },
    ],
  };
}
