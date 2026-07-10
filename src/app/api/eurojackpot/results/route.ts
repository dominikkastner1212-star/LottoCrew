import { NextResponse } from "next/server";

import { EurojackpotResultsProxyError, fetchProxiedEurojackpotResult } from "@/lib/eurojackpot-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await fetchProxiedEurojackpotResult(searchParams.get("date"));
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof EurojackpotResultsProxyError ? error.status : 500;

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Eurojackpot-Zahlen konnten nicht abgerufen werden.",
      },
      { status },
    );
  }
}
