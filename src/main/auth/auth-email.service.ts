import { Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";
import { buildOtpEmail } from "./email/auth-email-template";

@Injectable()
export class AuthEmailService {
    private readonly logger = new Logger(AuthEmailService.name);
    private readonly transporter = this.createTransporter();

    private createTransporter() {
        const host = process.env.SMTP_HOST;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            return null;
        }

        return nodemailer.createTransport({
            host,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user,
                pass,
            },
        });
    }

    async sendOtpEmail(email: string, name: string, code: string, purpose: "LOGIN" | "REGISTER") {
        const { subject, text, html } = buildOtpEmail({ name, code, purpose });

        if (!this.transporter) {
            this.logger.warn(`SMTP is not configured. OTP for ${email}: ${code}`);
            return;
        }

        await this.transporter.sendMail({
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
            to: email,
            subject,
            text,
            html,
        });
    }
}