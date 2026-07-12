"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { calculateMonthlyContribution } from "@/lib/contribution-calculation";
import { formatCurrency } from "@/lib/utils";

type PreviewTicket = {
  date: string | null;
};

type PreviewWinning = {
  date: string;
  amount: number;
};

const inputStyle =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:border-amber-400";
const labelStyle = "text-sm font-semibold text-slate-600";

function getPreviousMonth(month: string) {
  if (!isMonthValue(month)) {
    return "";
  }
  const [year, monthIndex] = month.split("-").map((part) => Number(part));
  return new Date(Date.UTC(year, monthIndex - 2, 1)).toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  if (!isMonthValue(month)) {
    return "kein Monat ausgewählt";
  }
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(`${month}-01`));
}

function isMonthValue(month: string) {
  return /^\d{4}-\d{2}$/.test(month);
}

export function MonthlyPaymentsPreview({
  groupId,
  activeMemberCount,
  ticketFieldPrice,
  tickets,
  winnings,
}: {
  groupId: string;
  activeMemberCount: number;
  ticketFieldPrice: number;
  tickets: PreviewTicket[];
  winnings: PreviewWinning[];
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const preview = useMemo(() => {
    const previousMonth = getPreviousMonth(selectedMonth);
    const validMonth = isMonthValue(selectedMonth);
    const ticketFieldCount = validMonth ? tickets.filter((ticket) => ticket.date?.slice(0, 7) === selectedMonth).length : 0;
    const previousMonthWinnings = winnings
      .filter((winning) => winning.date.slice(0, 7) === previousMonth)
      .reduce((sum, winning) => sum + winning.amount, 0);
    const calculation = calculateMonthlyContribution({
      activeMemberCount,
      ticketFieldCount,
      ticketFieldPrice,
      previousMonthWinnings,
    });
    const maxPayment = Math.max(...calculation.paymentAmounts, calculation.contributionPerMember);
    const contributionText =
      calculation.paymentAmounts.length > 0 && maxPayment !== calculation.contributionPerMember
        ? `${formatCurrency(calculation.contributionPerMember)} bis ${formatCurrency(maxPayment)} pro Mitglied`
        : `${formatCurrency(calculation.contributionPerMember)} pro Mitglied`;

    return { calculation, contributionText, previousMonth };
  }, [activeMemberCount, selectedMonth, ticketFieldPrice, tickets, winnings]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <input type="hidden" name="group_id" value={groupId} />
        <label className="block">
          <span className={labelStyle}>Monat für alle aktiven Mitglieder</span>
          <input
            name="due_month"
            type="month"
            required
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className={inputStyle}
          />
        </label>
        <SubmitButton pendingLabel="Wird angelegt...">Monatsbeiträge erzeugen</SubmitButton>
      </div>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Berechnung für {formatMonth(selectedMonth)}</p>
        <p className="mt-2">
          Für {formatMonth(selectedMonth)} wurden {preview.calculation.ticketFieldCount} Kästchen gespielt. Bei{" "}
          {formatCurrency(preview.calculation.ticketFieldPrice)} pro Kästchen entstehen {formatCurrency(preview.calculation.gameCost)} Spielkosten.
          Im Vormonat {formatMonth(preview.previousMonth)} wurden {formatCurrency(preview.calculation.previousMonthWinnings)} Gewinne erfasst.
          Verteilt auf {preview.calculation.activeMemberCount} aktive Mitglieder ergibt das {preview.contributionText}.
        </p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-amber-800/80">Ausgewählter Monat</dt>
            <dd className="font-semibold">{formatMonth(selectedMonth)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Vormonat</dt>
            <dd className="font-semibold">{formatMonth(preview.previousMonth)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Aktive Mitglieder</dt>
            <dd className="font-semibold">{preview.calculation.activeMemberCount}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Kästchen im Monat</dt>
            <dd className="font-semibold">{preview.calculation.ticketFieldCount}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Kosten pro Kästchen</dt>
            <dd className="font-semibold">{formatCurrency(preview.calculation.ticketFieldPrice)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Spielkosten gesamt</dt>
            <dd className="font-semibold">{formatCurrency(preview.calculation.gameCost)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Gewinne aus dem Vormonat</dt>
            <dd className="font-semibold">{formatCurrency(preview.calculation.previousMonthWinnings)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Zu verteilender Betrag</dt>
            <dd className="font-semibold">{formatCurrency(preview.calculation.distributableAmount)}</dd>
          </div>
          <div>
            <dt className="text-amber-800/80">Beitrag pro Mitglied</dt>
            <dd className="font-semibold">{preview.contributionText}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-amber-800/80">
          Diese Anzeige ist nur eine Vorschau. Beim Erzeugen berechnet der Server die Beiträge erneut aus den aktuellen Daten.
        </p>
      </div>
    </>
  );
}
