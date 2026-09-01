import { serializeEurojackpotResult, type SerializableEurojackpotResult } from "./eurojackpot";

type Fetcher = typeof fetch;

export const DEFAULT_EUROJACKPOT_LIVE_API_URL =
  "https://raw.githubusercontent.com/protomultix/eurojackpot-api/main/public/api/draws.json";
export const DEFAULT_EUROJACKPOT_JACKPOT_PAGE_URL = "https://www.lotto.de/eurojackpot";

export type EurojackpotLiveSnapshot = {
  fetchedAt: string;
  provider: string;
  nextDraw: {
    drawDate: string;
    jackpot: number;
  } | null;
  latestResult: SerializableEurojackpotResult | null;
};

export class EurojackpotLiveError extends Error {
  constructor(message: string, public readonly status = 503) {
    super(message);
  }
}

export async function fetchEurojackpotLiveSnapshot(
  fetchImpl: Fetcher = fetch,
  apiUrl = process.env.EUROJACKPOT_LIVE_API_URL,
  jackpotPageUrl = process.env.EUROJACKPOT_JACKPOT_PAGE_URL ?? DEFAULT_EUROJACKPOT_JACKPOT_PAGE_URL,
  now = new Date(),
) {
  const configuredUrl = apiUrl?.trim() || DEFAULT_EUROJACKPOT_LIVE_API_URL;

  const response = await fetchImpl(configuredUrl, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new EurojackpotLiveError(`Eurojackpot-Livedaten konnten nicht abgerufen werden (${response.status}).`, 502);
  }

  const snapshot = normalizeEurojackpotLiveSnapshot(await response.json());
  const configuredJackpotPageUrl = jackpotPageUrl?.trim();

  if (snapshot.nextDraw || !configuredJackpotPageUrl) {
    return snapshot;
  }

  const jackpotDraw = await fetchOptionalJackpotPage(fetchImpl, configuredJackpotPageUrl, now);
  return jackpotDraw ? { ...snapshot, nextDraw: jackpotDraw } : snapshot;
}

export function normalizeEurojackpotLiveSnapshot(payload: unknown): EurojackpotLiveSnapshot {
  const candidates = collectRecords(payload);
  const latestResult = findLatestResult(candidates);
  const nextDraw = findNextDraw(candidates, latestResult);
  const provider = findFirstString(candidates, ["provider", "source_name", "source", "dataSource"]) ?? "custom";

  return {
    fetchedAt: new Date().toISOString(),
    provider,
    nextDraw,
    latestResult,
  };
}

function findLatestResult(candidates: Record<string, unknown>[]) {
  for (const candidate of candidates) {
    if (!isEurojackpotCandidate(candidate)) continue;

    const nestedResult = firstRecord(candidate.results);
    const numberSource = nestedResult ?? candidate;
    const numbers = readNumberArray(numberSource, [
      "numbers",
      "mainNumbers",
      "main_numbers",
      "resultNumbers",
      "result_numbers",
      "resultsJson",
      "primary",
      "winningNumbers",
    ]);
    const euroNumbers = readNumberArray(numberSource, [
      "euroNumbers",
      "extraNumbers",
      "euro_numbers",
      "resultEuroNumbers",
      "result_extra_numbers",
      "specialResults",
      "secondary",
      "starNumbers",
    ]);

    if (numbers.length !== 5 || euroNumbers.length !== 2) continue;

    const drawDate = readDate(candidate, ["drawDate", "draw_date", "date"]) ?? readDate(numberSource, ["drawDate", "draw_date", "date"]);
    if (!drawDate) continue;

    return serializeEurojackpotResult({
      drawDate,
      numbers,
      euroNumbers,
      prizeAmounts: readPrizeAmounts(candidate) ?? readPrizeAmounts(numberSource),
    });
  }

  return null;
}

function findNextDraw(
  candidates: Record<string, unknown>[],
  latestResult: SerializableEurojackpotResult | null,
): EurojackpotLiveSnapshot["nextDraw"] {
  for (const candidate of candidates) {
    if (!isEurojackpotCandidate(candidate)) continue;

    const drawDate = readDate(candidate, [
      "nextDrawDate",
      "next_draw_date",
      "nextDraw",
      "drawDate",
      "draw_date",
      "date",
      "drawTime",
    ]);
    const jackpot = readAmount(candidate, [
      "nextJackpot",
      "next_jackpot",
      "jackpot",
      "jackpotAmount",
      "jackpot_amount",
      "closestPrizeValue",
      "amount",
    ]);

    if (drawDate && jackpot !== null) {
      return { drawDate, jackpot };
    }
  }

  return latestResult ? null : null;
}

export function extractEurojackpotJackpotFromPage(html: string, now = new Date()): EurojackpotLiveSnapshot["nextDraw"] {
  const text = normalizePageText(html);
  const jackpot = readJackpotAmountFromPageText(text);
  if (jackpot === null) {
    return null;
  }

  return {
    drawDate: getNextEurojackpotDrawDate(now),
    jackpot,
  };
}

async function fetchOptionalJackpotPage(fetchImpl: Fetcher, pageUrl: string, now: Date) {
  try {
    const response = await fetchImpl(pageUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "LottoCrew live jackpot crawler",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return extractEurojackpotJackpotFromPage(await response.text(), now);
  } catch {
    return null;
  }
}

function normalizePageText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&euro;|&#8364;/gi, "EUR")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function readJackpotAmountFromPageText(text: string) {
  const millionAmountPattern = /(\d{1,3}(?:[,.]\d{1,2})?)\s*(?:mio\.?|million(?:en)?)\s*(?:eur|euro|€)?/gi;
  const euroAmountPattern = /(\d{1,3}(?:[.\s]\d{3})+(?:,\d{2})?)\s*(?:eur|euro|€)/gi;

  return readFirstJackpotAmount(text, millionAmountPattern, 1_000_000) ?? readFirstJackpotAmount(text, euroAmountPattern, 1);
}

function readFirstJackpotAmount(text: string, pattern: RegExp, multiplier: number) {
  for (const match of text.matchAll(pattern)) {
    const amountText = match[1];
    if (!amountText || match.index === undefined) continue;

    const context = text.slice(Math.max(0, match.index - 90), match.index + 140);
    const guardContext = text.slice(Math.max(0, match.index - 18), match.index + match[0].length + 15);
    if (!/jackpot/i.test(context) || /\b(?:min\.?|mindestens|garantie|garantiert)\b/i.test(guardContext)) {
      continue;
    }

    const amount = parseGermanAmount(amountText) * multiplier;
    if (Number.isFinite(amount) && amount >= 1_000_000) {
      return Math.round(amount);
    }
  }

  return null;
}

function parseGermanAmount(value: string) {
  const hasDecimalComma = /,\d{1,2}$/.test(value);
  const normalized = hasDecimalComma ? value.replace(/\./g, "").replace(",", ".") : value.replace(/[.\s]/g, "").replace(",", ".");
  return Number(normalized);
}

function getNextEurojackpotDrawDate(now: Date) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay();
  const daysUntilDraw = day <= 2 ? 2 - day : day <= 5 ? 5 - day : 9 - day;
  date.setUTCDate(date.getUTCDate() + daysUntilDraw);
  return date.toISOString().slice(0, 10);
}

function collectRecords(value: unknown, output: Record<string, unknown>[] = [], depth = 0) {
  if (depth > 5 || !value) {
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectRecords(entry, output, depth + 1));
    return output;
  }

  if (typeof value !== "object") {
    return output;
  }

  const record = value as Record<string, unknown>;
  output.push(record);

  ["items", "draws", "results", "nextDraw", "next_draw", "latestResult", "latest_result", "EJACKPOT", "jackpots"].forEach((key) => {
    collectRecords(record[key], output, depth + 1);
  });

  const draws = asRecord(record.draws);
  if (draws) {
    collectRecords(draws.EJACKPOT ?? draws.EuroJackpot ?? draws.eurojackpot, output, depth + 1);
  }

  return output;
}

function isEurojackpotCandidate(record: Record<string, unknown>) {
  const gameType = readString(record, ["gameType", "game", "lottery", "lotteryType", "id", "name"]);
  return !gameType || /euro\s*jackpot|ejackpot/i.test(gameType);
}

function firstRecord(value: unknown) {
  if (Array.isArray(value)) {
    return asRecord(value[0]);
  }
  return asRecord(value);
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readDate(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const date = value.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (date) return date;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const date = new Date(value).toISOString().slice(0, 10);
      if (date) return date;
    }
  }
  return null;
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

function findFirstString(records: Record<string, unknown>[], keys: string[]) {
  for (const record of records) {
    const value = readString(record, keys);
    if (value) return value;
  }
  return null;
}

function readNumberArray(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value) && value.every((entry) => typeof entry === "number" || typeof entry === "string")) {
      const numbers = value.map((entry) => Number(entry));
      if (numbers.every((number) => Number.isInteger(number))) {
        return numbers;
      }
    }
  }
  return [];
}

function readAmount(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const normalized = Number(value.replace(/[^\d,.-]/g, "").replace(",", "."));
      if (Number.isFinite(normalized)) {
        return normalized;
      }
    }
  }
  return null;
}

function readPrizeAmounts(record: Record<string, unknown>) {
  const raw = record.prizeAmounts ?? record.prizes ?? record.winningAmounts ?? record.prize_breakdown;
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const amounts = new Map<string, number>();
  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const prize = asRecord(entry);
      if (!prize) return;
      const key = readString(prize, ["key", "rank", "class", "name", "label"]);
      const amount = readAmount(prize, ["amount", "value", "prizeValue", "shareAmount"]);
      if (key && amount !== null) amounts.set(key, amount);
    });
  } else {
    Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
      const prize = asRecord(value);
      const amount = prize ? readAmount(prize, ["amount", "value", "prizeValue", "shareAmount"]) : Number(value);
      if (amount !== null && Number.isFinite(amount)) amounts.set(key, amount);
    });
  }

  return amounts.size ? amounts : undefined;
}
