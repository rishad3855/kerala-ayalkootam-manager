import nodemailer from "nodemailer";
import twilio from "twilio";

export async function sendEmailReminder({ to, subject, text }) {
  if (!process.env.SMTP_HOST || !to) return { skipped: true };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  return transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text });
}

export async function sendSmsReminder({ to, body }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_FROM || !to) return { skipped: true };
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client.messages.create({ from: process.env.TWILIO_FROM, to, body });
}
