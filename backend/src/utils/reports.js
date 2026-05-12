import PDFDocument from "pdfkit";
import { stringify } from "csv-stringify/sync";

export function transactionsCsv(transactions) {
  return stringify(
    transactions.map((tx) => ({
      date: tx.date.toISOString().slice(0, 10),
      member: tx.member?.name || "",
      type: tx.type,
      amount: tx.amount,
      description: tx.description
    })),
    { header: true }
  );
}

export function transactionsPdf(transactions, title = "Ayalkootam Report") {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 36, size: "A4", bufferPages: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = doc.page.margins.left;
    const right = pageWidth - doc.page.margins.right;
    const tableWidth = right - left;
    const rowHeight = 28;
    const bottom = pageHeight - doc.page.margins.bottom - 26;
    const columns = [
      { label: "Date", key: "date", width: 72 },
      { label: "Member", key: "member", width: 128 },
      { label: "Type", key: "type", width: 92 },
      { label: "Amount", key: "amount", width: 70 },
      { label: "Description", key: "description", width: tableWidth - 362 }
    ];

    const totals = transactions.reduce(
      (sum, tx) => {
        sum.count += 1;
        sum[tx.type] = (sum[tx.type] || 0) + Number(tx.amount || 0);
        return sum;
      },
      { count: 0, thrift: 0, loan_issue: 0, loan_repay: 0, withdrawal: 0 }
    );

    function money(value) {
      return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function typeLabel(type) {
      return String(type || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function drawHeader() {
      doc.rect(0, 0, pageWidth, 78).fill("#176B3A");
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18).text(title, left, 24, { width: tableWidth });
      doc.font("Helvetica").fontSize(9).text(`Generated: ${new Date().toLocaleString("en-IN")}`, left, 49);
      doc.fillColor("#142118");
    }

    function drawSummary(y) {
      const cardGap = 8;
      const cardWidth = (tableWidth - cardGap * 3) / 4;
      const cards = [
        ["Transactions", totals.count],
        ["Thrift", money(totals.thrift)],
        ["Loans Issued", money(totals.loan_issue)],
        ["Withdrawals", money(totals.withdrawal)]
      ];

      cards.forEach(([label, value], index) => {
        const x = left + index * (cardWidth + cardGap);
        doc.roundedRect(x, y, cardWidth, 52, 5).fillAndStroke("#F0FDF4", "#D1FAE5");
        doc.fillColor("#64748B").font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), x + 10, y + 10, { width: cardWidth - 20 });
        doc.fillColor("#142118").fontSize(13).text(String(value), x + 10, y + 27, { width: cardWidth - 20 });
      });
      doc.fillColor("#142118");
    }

    function drawTableHeader(y) {
      doc.rect(left, y, tableWidth, 24).fill("#E8F5EC");
      let x = left;
      columns.forEach((column) => {
        doc.fillColor("#176B3A").font("Helvetica-Bold").fontSize(8).text(column.label.toUpperCase(), x + 6, y + 8, {
          width: column.width - 12,
          lineBreak: false
        });
        x += column.width;
      });
      doc.fillColor("#142118");
      return y + 24;
    }

    function drawFooter() {
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        doc.fillColor("#94A3B8").font("Helvetica").fontSize(8).text(`Page ${i + 1} of ${range.count}`, left, pageHeight - 38, {
          width: tableWidth,
          align: "right"
        });
      }
      doc.fillColor("#142118");
    }

    drawHeader();
    drawSummary(96);
    let y = drawTableHeader(166);

    transactions.forEach((tx, index) => {
      if (y + rowHeight > bottom) {
        doc.addPage();
        drawHeader();
        y = drawTableHeader(100);
      }

      const fill = index % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
      doc.rect(left, y, tableWidth, rowHeight).fillAndStroke(fill, "#E2E8F0");
      const values = {
        date: tx.date.toISOString().slice(0, 10),
        member: tx.member?.name || "Member",
        type: typeLabel(tx.type),
        amount: money(tx.amount),
        description: tx.description || "-"
      };

      let x = left;
      columns.forEach((column) => {
        doc.fillColor("#142118").font("Helvetica").fontSize(8.5).text(values[column.key], x + 6, y + 8, {
          width: column.width - 12,
          height: rowHeight - 10,
          ellipsis: true
        });
        x += column.width;
      });
      y += rowHeight;
    });

    if (!transactions.length) {
      doc.rect(left, y, tableWidth, 44).fillAndStroke("#FFFFFF", "#E2E8F0");
      doc.fillColor("#64748B").font("Helvetica").fontSize(10).text("No transactions found.", left, y + 15, {
        width: tableWidth,
        align: "center"
      });
    }

    drawFooter();
    doc.end();
  });
}
