import { getAppContext } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const app = await getAppContext();

  if (!app.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = [
    ["Mitglied", "Monat", "Betrag", "Status", "Bezahlt am"],
    ...app.payments.map((payment) => [
      payment.member,
      payment.month,
      payment.amount.toFixed(2),
      payment.status,
      payment.paidAt ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="lottocrew-zahlungen.csv"',
    },
  });
}
