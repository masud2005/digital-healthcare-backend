import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";
import { buildDoctorCredentialEmail } from "../templates/doctor-credential-email-template";

@Injectable()
export class DoctorMailService {
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

    assertReady() {
        if (!this.transporter) {
            throw new ServiceUnavailableException("SMTP provider is not configured");
        }
    }

    async sendCredentials(input: { name: string; email: string; password: string }) {
        this.assertReady();
        const { subject, text, html } = buildDoctorCredentialEmail(input);

        await this.transporter!.sendMail({
            from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
            to: input.email,
            subject,
            text,
            html,
        });
    }
}
