import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!transporter) {
    console.log(`[MediaVault] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your MediaVault password",
    html: `<p>You requested a password reset.</p>
           <p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>
           <p>If you did not request this, you can ignore this email.</p>`,
  });
}
