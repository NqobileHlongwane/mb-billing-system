import nodemailer from "nodemailer";

export const sendInvoiceEmail = async ({
  to,
  clientName,
  invoice,
  pdfBuffer,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or SMTP provider
    auth: {
      user:"nqobilehlongwane708@gmail.com",
      pass: "pmvnidqmfnjtzuhm ", // app password (not normal password)
    },
  });

  await transporter.sendMail({
    from: `"MB Attorneys Law Firm" <${'nqobilehlongwane708@gmail.com'}>`,
    to,
    subject: `Invoice #${invoice.id}`,
    html: `
      <p>Dear ${clientName},</p>

      <p>Please find attached your invoice.</p>

      <p><strong>Total:</strong> R${invoice.total_amount}</p>

      <p>Kind regards,<br/>MB Attorneys</p>
    `,
    attachments: [
      {
        filename: `invoice-${invoice.id}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};