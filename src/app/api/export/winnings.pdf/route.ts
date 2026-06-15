import { getAppContext } from "@/lib/app-data";

export const dynamic = "force-dynamic";

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

export async function GET() {
  const app = await getAppContext();
  const lines = [
    "LottoCrew Gewinnhistorie",
    "",
    ...app.winnings.map((winning) => `${winning.date}  ${winning.ticket}  EUR ${winning.amount.toFixed(2)}  ${winning.rank}`),
  ];
  const stream = `BT /F1 18 Tf 72 760 Td (${escapePdfText(lines.join("\\n"))}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Response(pdf, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="lottocrew-gewinne.pdf"',
    },
  });
}
