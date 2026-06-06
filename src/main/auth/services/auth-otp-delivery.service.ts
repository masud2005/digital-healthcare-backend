import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";
import { buildOtpEmail } from "../templates/auth-email-template";
import { buildOtpSms } from "../templates/auth-sms-template";

@Injectable()
export class AuthOtpDeliveryService {
    private readonly logger = new Logger(AuthOtpDeliveryService.name);
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

    async sendOtpEmail(
        email: string,
        name: string,
        code: string,
        purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD",
    ) {
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

    async sendOtpPhone(
        phone: string,
        code: string,
        purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD",
    ) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        const from = process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || (!messagingServiceSid && !from)) {
            throw new ServiceUnavailableException("SMS provider is not configured");
        }

        const body = new URLSearchParams({
            To: phone,
            Body: buildOtpSms({ code, purpose }),
        });

        if (messagingServiceSid) {
            body.set("MessagingServiceSid", messagingServiceSid);
        } else if (from) {
            body.set("From", from);
        }

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body,
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();
            this.logger.error(`Twilio SMS failed with status ${response.status}: ${errorBody}`);
            throw new ServiceUnavailableException("Unable to send SMS verification code");
        }
    }
}
