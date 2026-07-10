import { describe, expect, it, vi } from "vitest";

import { fetchProxiedEurojackpotResult } from "./eurojackpot-proxy";

describe("eurojackpot results proxy", () => {
  it("rejects missing or invalid draw dates", async () => {
    await expect(fetchProxiedEurojackpotResult("2026/07/10")).rejects.toMatchObject({
      message: "Bitte ein gueltiges Ziehungsdatum als date=YYYY-MM-DD uebergeben.",
      status: 400,
    });
  });

  it("requires a configured upstream URL", async () => {
    await expect(fetchProxiedEurojackpotResult("2026-07-10", vi.fn(), "")).rejects.toMatchObject({
      message: "EUROJACKPOT_UPSTREAM_RESULTS_API_URL ist nicht gesetzt.",
      status: 503,
    });
  });

  it("fetches and normalizes upstream results", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        date: "2026-07-10",
        mainNumbers: [1, 2, 3, 4, 5],
        extraNumbers: [6, 7],
        prizes: { "5+2": 120000000, "3+1": 18.5 },
      }),
    ) as unknown as typeof fetch;

    await expect(
      fetchProxiedEurojackpotResult(
        "2026-07-10",
        fetchImpl,
        "https://provider.example/eurojackpot/results/{date}",
      ),
    ).resolves.toEqual({
      drawDate: "2026-07-10",
      numbers: [1, 2, 3, 4, 5],
      euroNumbers: [6, 7],
      prizeAmounts: { "5+2": 120000000, "3+1": 18.5 },
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://provider.example/eurojackpot/results/2026-07-10", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  });

  it("returns provider failures as proxy errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 500 })) as unknown as typeof fetch;

    await expect(
      fetchProxiedEurojackpotResult("2026-07-10", fetchImpl, "https://provider.example/results"),
    ).rejects.toMatchObject({
      message: "Eurojackpot-Zahlen konnten nicht abgerufen werden (500).",
      status: 502,
    });
  });
});
