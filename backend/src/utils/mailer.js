import nodemailer from "nodemailer";

// No SMTP provider has been chosen yet (Nodemailer is just the library --
// it still needs a real account, e.g. Gmail/Workspace SMTP with an app
// password, behind SMTP_HOST/PORT/USER/PASS). Until those env vars exist,
// fall back to logging the email to the console so activation links are
// still usable for testing without blocking on that decision.
const smtpConfigured = Boolean(process.env.SMTP_HOST);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n[mailer] SMTP not configured -- logging email instead of sending it.`);
    console.log(`[mailer] To: ${to}`);
    console.log(`[mailer] Subject: ${subject}`);
    console.log(`[mailer] Body:\n${text}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}
