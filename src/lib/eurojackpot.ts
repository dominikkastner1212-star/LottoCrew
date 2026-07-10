type Fetcher = typeof fetch;

export type EurojackpotPrizeRank = {
  key: string;
  label: string;
};

export type EurojackpotResult = {
  drawDate: string;
  numbers: number[];
  euroNumbers: number[];
  prizeAmounts?: Map<string, number>;
};

export type TicketNumberSet = {
  id: string;
  numbers: number[];
  euroNumbers: number[];
};

export type TicketEvaluation = {
  ticketId: string;
  mainMatches: number;
  euroMatches: number;
  prizeKey: string | null;
  prizeRank: string | null;
  amount: number;
};

export type WinningDraft = {
  ticketId: string;
  amount: number;
  mainMatches: number;
  euroMatches: number;
  prizeKey: string;
  prizeRank: string;
};

export type WinningShareSource = {
  id: string;
  ticketId: string;
  amount: number;
  prizeRank: string | null;
};

export type WinningShareTransactionRow = {
  group_id: string;
  member_id: string;
  type: "winning_share";
  amount: number;
  description: string;
  related_ticket_id: string;
  related_winning_id: string;
  created_by: string;
};

const prizeRanks: Record<string, string> = {
  "5+2": "Gewinnklasse 1",
  "5+1": "Gewinnklasse 2",
  "5+0": "Gewinnklasse 3",
  "4+2": "Gewinnklasse 4",
  "4+1": "Gewinnklasse 5",
  "3+2": "Gewinnklasse 6",
  "4+0": "Gewinnklasse 7",
  "2+2": "Gewinnklasse 8",
  "3+1": "Gewinnklasse 9",
  "3+0": "Gewinnklasse 10",
  "1+2": "Gewinnklasse 11",
  "2+1": "Gewinnklasse 12",
};

export function countMatches(ticketNumbers: number[], resultNumbers: number[]) {
  const resultSet = new Set(resultNumbers);
  return ticketNumbers.filter((number) => resultSet.has(number)).length;
}

export function getEurojackpotPrizeRank(mainMatches: number, euroMatches: number): EurojackpotPrizeRank | null {
  const key = `${mainMatches}+${euroMatches}`;
  const label = prizeRanks[key];
  return label ? { key, label } : null;
}

export function buildEurojackpotResultUrl(apiUrl: string, drawDate: string) {
  if (apiUrl.includes("{date}")) {
    return apiUrl.replaceAll("{date}", encodeURIComponent(drawDate));
  }

  const url = new URL(apiUrl);
  url.searchParams.set("date", drawDate);
  return url.toString();
}

export async function fetchEurojackpotResult(
  drawDate: string,
  fetchImpl: Fetcher = fetch,
  apiUrl = process.env.EUROJACKPOT_RESULTS_API_URL,
) {
  const configuredUrl = apiUrl?.trim();
  if (!configuredUrl) {
    throw new Error("EUROJACKPOT_RESULTS_API_URL ist nicht gesetzt.");
  }

  const response = await fetchImpl(buildEurojackpotResultUrl(configuredUrl, drawDate), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Eurojackpot-Zahlen konnten nicht abgerufen werden (${response.status}).`);
  }

  return normalizeEurojackpotResult(await response.json(), drawDate);
}

export function evaluateTicketsForDraw(
  tickets: TicketNumberSet[],
  result: EurojackpotResult,
  manualWinningTicketIds: Set<string>,
) {
  const ticketEvaluations: TicketEvaluation[] = [];
  const autoWinningDrafts: WinningDraft[] = [];

  tickets.forEach((ticket) => {
    const mainMatches = countMatches(ticket.numbers, result.numbers);
    const euroMatches = countMatches(ticket.euroNumbers, result.euroNumbers);
    const prizeRank = getEurojackpotPrizeRank(mainMatches, euroMatches);
    const amount = prizeRank ? getPrizeAmount(result.prizeAmounts, prizeRank) : 0;

    ticketEvaluations.push({
      ticketId: ticket.id,
      mainMatches,
      euroMatches,
      prizeKey: prizeRank?.key ?? null,
      prizeRank: prizeRank?.label ?? null,
      amount,
    });

    if (prizeRank && !manualWinningTicketIds.has(ticket.id)) {
      autoWinningDrafts.push({
        ticketId: ticket.id,
        amount,
        mainMatches,
        euroMatches,
        prizeKey: prizeRank.key,
        prizeRank: prizeRank.label,
      });
    }
  });

  return { ticketEvaluations, autoWinningDrafts };
}

export function splitAmountByMember(amount: number, memberCount: number) {
  if (memberCount <= 0 || amount <= 0) {
    return [];
  }

  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / memberCount);
  let remainder = totalCents - baseCents * memberCount;

  return Array.from({ length: memberCount }, () => {
    let cents = baseCents;
    if (remainder > 0) {
      cents += 1;
      remainder -= 1;
    }
    return cents / 100;
  }).filter((share) => share > 0);
}

export function buildWinningShareTransactions({
  groupId,
  memberIds,
  winnings,
  createdBy,
  existingRelatedWinningIds = new Set<string>(),
}: {
  groupId: string;
  memberIds: string[];
  winnings: WinningShareSource[];
  createdBy: string;
  existingRelatedWinningIds?: Set<string>;
}) {
  return winnings.flatMap((winning) => {
    if (winning.amount <= 0 || existingRelatedWinningIds.has(winning.id)) {
      return [];
    }

    return splitAmountByMember(winning.amount, memberIds.length).map((share, index) => ({
      group_id: groupId,
      member_id: memberIds[index],
      type: "winning_share" as const,
      amount: share,
      description: `Gewinnanteil: ${winning.prizeRank ?? "Gewinn"}`,
      related_ticket_id: winning.ticketId,
      related_winning_id: winning.id,
      created_by: createdBy,
    }));
  });
}

function normalizeEurojackpotResult(payload: unknown, fallbackDate: string): EurojackpotResult {
  if (!payload || typeof payload !== "object") {
    throw new Error("Eurojackpot-Antwort ist ungueltig.");
  }

  const record = payload as Record<string, unknown>;
  const numbers = readNumberArray(record, ["numbers", "mainNumbers", "resultNumbers", "result_numbers"]);
  const euroNumbers = readNumberArray(record, ["euroNumbers", "extraNumbers", "resultEuroNumbers", "result_extra_numbers"]);

  assertEurojackpotNumbers(numbers, euroNumbers);

  return {
    drawDate: readString(record, ["drawDate", "draw_date", "date"]) ?? fallbackDate,
    numbers,
    euroNumbers,
    prizeAmounts: normalizePrizeAmounts(record.prizeAmounts ?? record.prizes ?? record.winningAmounts),
  };
}

function readNumberArray(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map((part) => Number(part));
    }
  }
  return [];
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizePrizeAmounts(value: unknown) {
  if (!value) {
    return undefined;
  }

  const amounts = new Map<string, number>();

  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }
      const record = entry as Record<string, unknown>;
      const key = String(record.key ?? record.rank ?? record.class ?? "").trim();
      const amount = Number(record.amount ?? record.value ?? 0);
      addPrizeAmount(amounts, key, amount);
    });
  } else if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, rawAmount]) => {
      addPrizeAmount(amounts, key, Number(rawAmount));
    });
  }

  return amounts.size ? amounts : undefined;
}

function addPrizeAmount(amounts: Map<string, number>, key: string, amount: number) {
  if (!key || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  amounts.set(key, amount);
  const normalizedClass = key.match(/Gewinnklasse\s*(\d+)/i)?.[1];
  if (normalizedClass) {
    amounts.set(`Gewinnklasse ${normalizedClass}`, amount);
  }
}

function getPrizeAmount(amounts: Map<string, number> | undefined, prizeRank: EurojackpotPrizeRank) {
  return amounts?.get(prizeRank.key) ?? amounts?.get(prizeRank.label) ?? 0;
}

function assertEurojackpotNumbers(numbers: number[], euroNumbers: number[]) {
  if (numbers.length !== 5 || euroNumbers.length !== 2) {
    throw new Error("Eurojackpot-Antwort braucht 5 Hauptzahlen und 2 Eurozahlen.");
  }
  if (numbers.some((number) => !Number.isInteger(number) || number < 1 || number > 50)) {
    throw new Error("Eurojackpot-Hauptzahlen muessen zwischen 1 und 50 liegen.");
  }
  if (euroNumbers.some((number) => !Number.isInteger(number) || number < 1 || number > 12)) {
    throw new Error("Eurojackpot-Eurozahlen muessen zwischen 1 und 12 liegen.");
  }
}
