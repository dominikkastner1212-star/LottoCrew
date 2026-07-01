import { getAppContext } from "@/lib/app-data";

export const dynamic = "force-dynamic";

const MARGIN_LEFT = 56;
const MARGIN_TOP = 780;
const MARGIN_BOTTOM = 56;
const TITLE_SIZE = 18;
const TITLE_GAP = 30;
const BODY_SIZE = 11;
const LINE_HEIGHT = 16;

type PdfLine = { text: string; size: number; gapAfter: number };

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function chunkLines(lines: PdfLine[]) {
  const pages: PdfLine[][] = [];
  let current: PdfLine[] = [];
  let y = MARGIN_TOP;

  for (const line of lines) {
    if (y - line.gapAfter < MARGIN_BOTTOM) {
      pages.push(current);
      current = [];
      y = MARGIN_TOP;
    }
    current.push(line);
    y -= line.gapAfter;
  }

  if (current.length > 0 || pages.length === 0) {
    pages.push(current);
  }

  return pages;
}

function buildPageContent(lines: PdfLine[]) {
  const ops: string[] = ["BT"];
  let y = MARGIN_TOP;

  for (const line of lines) {
    ops.push(`/F1 ${line.size} Tf`);
    ops.push(`1 0 0 1 ${MARGIN_LEFT} ${y} Tm`);
    ops.push(`(${escapePdfText(line.text)}) Tj`);
    y -= line.gapAfter;
  }

  ops.push("ET");
  return ops.join("\n");
}

function buildPdf(pagesContent: string[]) {
  const fontObjNum = 3;
  const pageObjNums = pagesContent.map((_, index) => 4 + index * 2);
  const contentObjNums = pagesContent.map((_, index) => 5 + index * 2);

  const objects: string[] = [];
  objects[0] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[1] = `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${pagesContent.length} >>`;
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

  pagesContent.forEach((content, index) => {
    const pageObjNum = pageObjNums[index];
    const contentObjNum = contentObjNums[index];
    objects[pageObjNum - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`;
    objects[contentObjNum - 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

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

  return pdf;
}

export async function GET() {
  const app = await getAppContext();

  if (!app.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const lines: PdfLine[] = [
    { text: "LottoCrew Gewinnhistorie", size: TITLE_SIZE, gapAfter: TITLE_GAP },
  ];

  if (app.winnings.length === 0) {
    lines.push({ text: "Noch keine Gewinne erfasst.", size: BODY_SIZE, gapAfter: LINE_HEIGHT });
  } else {
    app.winnings.forEach((winning) => {
      const date = new Date(winning.date).toLocaleDateString("de-DE");
      lines.push({
        text: `${date}   ${winning.ticket}   ${winning.amount.toFixed(2)} EUR   ${winning.rank}`,
        size: BODY_SIZE,
        gapAfter: LINE_HEIGHT,
      });
    });
  }

  const pages = chunkLines(lines);
  const pdf = buildPdf(pages.map(buildPageContent));

  return new Response(Buffer.from(pdf, "latin1"), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="lottocrew-gewinne.pdf"',
    },
  });
}
