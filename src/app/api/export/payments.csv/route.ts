import { payments } from "@/lib/sample-data";

export function GET() {
  const rows = [
    ["Mitglied", "Monat", "Betrag", "Status", "Bezahlt am"],
    ...payments.map((payment) => [
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
