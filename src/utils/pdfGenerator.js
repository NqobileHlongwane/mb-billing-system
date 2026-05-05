import PDFDocument from "pdfkit";

export const generateInvoicePDF = (invoice, entries, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice.id}.pdf`
  );

  doc.pipe(res);

  // =========================
  // HEADER (LAW FIRM)
  // =========================
  doc
    .fontSize(18)
    .text("MB Attorneys", { align: "left" });

  doc
    .fontSize(10)
    .text("Attorneys & Legal Consultants")
    .text("Johannesburg, South Africa")
    .text("Email: info@MBlawfirm.com")
    .text("Phone: +27 76 130 9839");

  doc.moveDown();

  // =========================
  // INVOICE TITLE
  // =========================
  doc
    .fontSize(20)
    .text("INVOICE", { align: "right" });

  doc
    .fontSize(10)
    .text(`Invoice No.: ${invoice.id}`, { align: "right" })
    .text(`Date: ${new Date().toLocaleDateString()}`, {
      align: "right",
    });

  doc.moveDown();

  // =========================
  // CLIENT INFO
  // =========================
  doc
    .fontSize(12)
    .text("Bill To:")
    .fontSize(10)
    .text(`Client: ${invoice.client_name}`);

  doc.moveDown();

  // =========================
  // TABLE HEADER
  // =========================
  doc.moveDown();
  doc.fontSize(12).text("Billing Details");

  doc.moveDown();

  const tableTop = doc.y;

  doc.fontSize(10).text("Description", 50, tableTop);
  doc.text("Start", 200, tableTop);
  doc.text("End", 300, tableTop);
  doc.text("Hours", 400, tableTop);
  doc.text("Amount", 470, tableTop);

  doc.moveDown();

  // =========================
  // TABLE ROWS
  // =========================
  let y = doc.y + 5;
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);

  entries.forEach((e) => {
    doc
      .fontSize(9)
      .text(e.description, 50, y)
      .text(new Date(e.start_time).toLocaleString(), 200, y)
      .text(new Date(e.end_time).toLocaleString(), 300, y)
      .text(e.duration?.toFixed(2) || "-", 400, y)
      .text(formatCurrency(e.amount),480, y );

    y += 20;
  });

  doc.moveDown();

  // =========================
  // TOTAL
  // =========================
  doc.moveTo(50, y).lineTo(550, y).stroke();

  doc
    .fontSize(12)
    .text(`TOTAL: R${invoice.total_amount.toFixed(2)}`, 400, y + 10, {
      align: "right",
    });

  doc.moveDown(2);

  // =========================
  // PAYMENT INFO
  // =========================
  doc
    .fontSize(10)
    .text("Payment Details:")
    .text("Bank: Capitec Bank")
    .text("Account: 123456789")
    .text("Reference: Invoice Number");

  doc.moveDown();

  doc
    .fontSize(10)
    .text("Thank you .", {
      align: "center",
    });

  doc.end();
};