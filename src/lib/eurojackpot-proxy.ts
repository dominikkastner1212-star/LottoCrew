import {
  fetchEurojackpotResult,
  serializeEurojackpotResult,
  type SerializableEurojackpotResult,
} from "./eurojackpot";

type Fetcher = typeof fetch;

const drawDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export class EurojackpotResultsProxyError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function fetchProxiedEurojackpotResult(
  drawDate: string | null,
  fetchImpl: Fetcher = fetch,
  upstreamUrl = process.env.EUROJACKPOT_UPSTREAM_RESULTS_API_URL,
): Promise<SerializableEurojackpotResult> {
  const validDrawDate = validateDrawDate(drawDate);
  const configuredUrl = upstreamUrl?.trim();

  if (!configuredUrl) {
    throw new EurojackpotResultsProxyError("EUROJACKPOT_UPSTREAM_RESULTS_API_URL ist nicht gesetzt.", 503);
  }

  try {
    const result = await fetchEurojackpotResult(validDrawDate, fetchImpl, configuredUrl);
    return serializeEurojackpotResult(result);
  } catch (error) {
    throw new EurojackpotResultsProxyError(
      error instanceof Error ? error.message : "Eurojackpot-Zahlen konnten nicht abgerufen werden.",
      502,
    );
  }
}

function validateDrawDate(drawDate: string | null) {
  const normalizedDate = drawDate?.trim();

  if (!normalizedDate || !drawDatePattern.test(normalizedDate)) {
    throw new EurojackpotResultsProxyError(
      "Bitte ein gültiges Ziehungsdatum als date=YYYY-MM-DD übergeben.",
      400,
    );
  }

  return normalizedDate;
}
