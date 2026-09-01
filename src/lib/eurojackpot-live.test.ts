import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EUROJACKPOT_JACKPOT_PAGE_URL,
  DEFAULT_EUROJACKPOT_LIVE_API_URL,
  extractEurojackpotJackpotFromPage,
  fetchEurojackpotLiveSnapshot,
  normalizeEurojackpotLiveSnapshot,
} from "./eurojackpot-live";

describe("eurojackpot live data", () => {
  it("normalizes a generic next-draw payload", () => {
    expect(
      normalizeEurojackpotLiveSnapshot({
        nextDrawDate: "2026-09-04T18:00:00Z",
        nextJackpot: 45000000,
      }),
    ).toMatchObject({
      nextDraw: {
        drawDate: "2026-09-04",
        jackpot: 45000000,
      },
    });
  });

  it("normalizes a LOTTO OpenAPI style latest result", () => {
    expect(
      normalizeEurojackpotLiveSnapshot([
        {
          drawDate: "2026-08-28T20:00:00Z",
          gameType: "EuroJackpot",
          results: [
            {
              resultsJson: [1, 12, 23, 34, 45],
              specialResults: [6, 7],
            },
          ],
        },
      ]),
    ).toMatchObject({
      latestResult: {
        drawDate: "2026-08-28",
        numbers: [1, 12, 23, 34, 45],
        euroNumbers: [6, 7],
      },
    });
  });

  it("normalizes the free LOTTO Bayern archive feed", () => {
    expect(
      normalizeEurojackpotLiveSnapshot({
        source_name: "LOTTO Bayern Eurojackpot Archiv",
        latest_date: "2026-08-28",
        draws: [
          {
            date: "2026-08-28",
            main_numbers: [45, 34, 39, 23, 49],
            euro_numbers: [1, 4],
          },
        ],
      }),
    ).toMatchObject({
      provider: "LOTTO Bayern Eurojackpot Archiv",
      latestResult: {
        drawDate: "2026-08-28",
        numbers: [45, 34, 39, 23, 49],
        euroNumbers: [1, 4],
      },
      nextDraw: null,
    });
  });

  it("fetches a configured live snapshot without browser caching", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        draw_date: "2026-09-01",
        jackpot: 59000000,
        numbers: [6, 21, 31, 47, 48],
        euroNumbers: [2, 9],
      }),
    ) as unknown as typeof fetch;

    await expect(fetchEurojackpotLiveSnapshot(fetchImpl, "https://provider.example/live", "")).resolves.toMatchObject({
      latestResult: {
        drawDate: "2026-09-01",
        numbers: [6, 21, 31, 47, 48],
        euroNumbers: [2, 9],
      },
      nextDraw: {
        drawDate: "2026-09-01",
        jackpot: 59000000,
      },
    });

    expect(fetchImpl).toHaveBeenCalledWith("https://provider.example/live", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  });

  it("uses the free archive feed by default", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        draws: [{ date: "2026-08-28", main_numbers: [45, 34, 39, 23, 49], euro_numbers: [1, 4] }],
      }),
    ) as unknown as typeof fetch;

    await fetchEurojackpotLiveSnapshot(fetchImpl, "", "");

    expect(fetchImpl).toHaveBeenCalledWith(DEFAULT_EUROJACKPOT_LIVE_API_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  });

  it("extracts the current jackpot from a public page without using the minimum guarantee", () => {
    expect(
      extractEurojackpotJackpotFromPage(
        `
          <main>
            <p>Jeden Dienstag und Freitag im Jackpot Min. 10 Mio. EUR</p>
            <h1>Eurojackpot</h1>
            <p>Aktueller Jackpot: 59 Mio. EUR</p>
          </main>
        `,
        new Date("2026-09-02T08:00:00.000Z"),
      ),
    ).toEqual({
      drawDate: "2026-09-04",
      jackpot: 59000000,
    });
  });

  it("keeps live results when the optional jackpot page cannot be read", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          draws: [{ date: "2026-08-28", main_numbers: [45, 34, 39, 23, 49], euro_numbers: [1, 4] }],
        }),
      )
      .mockResolvedValueOnce(new Response("kaputt", { status: 503 })) as unknown as typeof fetch;

    await expect(fetchEurojackpotLiveSnapshot(fetchImpl, "", DEFAULT_EUROJACKPOT_JACKPOT_PAGE_URL)).resolves.toMatchObject({
      latestResult: {
        drawDate: "2026-08-28",
        numbers: [45, 34, 39, 23, 49],
        euroNumbers: [1, 4],
      },
      nextDraw: null,
    });
  });

  it("merges the free draw feed with a scraped jackpot page", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          draws: [{ date: "2026-08-28", main_numbers: [45, 34, 39, 23, 49], euro_numbers: [1, 4] }],
        }),
      )
      .mockResolvedValueOnce(
        new Response("<p>Jeden Dienstag und Freitag im Jackpot Min. 10 Mio. EUR</p><p>Jackpot: 59 Mio. EUR</p>", {
          headers: { "content-type": "text/html" },
        }),
      ) as unknown as typeof fetch;

    await expect(
      fetchEurojackpotLiveSnapshot(
        fetchImpl,
        "",
        DEFAULT_EUROJACKPOT_JACKPOT_PAGE_URL,
        new Date("2026-09-02T08:00:00.000Z"),
      ),
    ).resolves.toMatchObject({
      latestResult: {
        drawDate: "2026-08-28",
      },
      nextDraw: {
        drawDate: "2026-09-04",
        jackpot: 59000000,
      },
    });
  });
});
