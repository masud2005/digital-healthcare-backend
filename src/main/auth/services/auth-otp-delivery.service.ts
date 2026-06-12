import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";
import { SystemHealthService } from "../../(compliance)/system-health/system-health.service";
import { buildOtpEmail } from "../templates/auth-email-template";
import { buildOtpSms } from "../templates/auth-sms-template";

@Injectable()
export class AuthOtpDeliveryService implements OnModuleInit {
    private readonly logger = new Logger(AuthOtpDeliveryService.name);
    private readonly transporter = this.createTransporter();

    constructor(private readonly systemHealthService: SystemHealthService) {}

    async onModuleInit() {
        if (!this.transporter) {
            this.logger.warn("SMTP is not configured. Email OTP delivery is disabled.");
            return;
        }

        if (process.env.SMTP_VERIFY_ON_STARTUP !== "true") {
            return;
        }

        try {
            await this.transporter.verify();
            this.logger.log("SMTP connection verified");
        } catch (error) {
            this.logger.error("SMTP connection verification failed", error as Error);
        }
    }

    private createTransporter() {
        const host = process.env.SMTP_HOST?.trim();
        const user = process.env.SMTP_USER?.trim();
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            return null;
        }

        return nodemailer.createTransport({
            host,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_SECURE === "true",
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
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
            if (process.env.MAIL_LOG_OTP_WHEN_UNCONFIGURED === "true") {
                this.logger.warn(`SMTP is not configured. OTP for ${email}: ${code}`);
                return;
            }

            throw new ServiceUnavailableException("Email provider is not configured");
        }

        const startTime = Date.now();
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
                to: email,
                subject,
                text,
                html,
            });
            const duration = Date.now() - startTime;
            await this.systemHealthService.recordEmailDelivery(true, duration).catch(() => {});
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.systemHealthService.recordEmailDelivery(false, duration).catch(() => {});
            this.logger.error(`Failed to send OTP email to ${email}`, error as Error);
            throw new ServiceUnavailableException("Unable to send email verification code");
        }
    }

    async sendOtpPhone(
        phone: string,
        code: string,
        purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD",
    ) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_FROM_NUMBER ?? process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !from) {
            this.logger.error("Twilio credentials or phone number is missing in .env");
            throw new ServiceUnavailableException("SMS provider is not configured properly");
        }

        const formattedPhone = phone.trim().replace(/\s+/g, '');

        const body = new URLSearchParams({
            To: formattedPhone,
            Body: buildOtpSms({ code, purpose }),
            From: from,
        });

        const startTime = Date.now();
        try {
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

            const duration = Date.now() - startTime;
            if (!response.ok) {
                const errorBody = await response.text();
                this.logger.error(`Twilio SMS failed with status ${response.status}: ${errorBody}`);
                await this.systemHealthService.recordSmsDelivery(false, duration).catch(() => {});
                throw new ServiceUnavailableException("Unable to send SMS verification code");
            }

            await this.systemHealthService.recordSmsDelivery(true, duration).catch(() => {});
        } catch (error) {
            const duration = Date.now() - startTime;
            if (!(error instanceof ServiceUnavailableException)) {
                await this.systemHealthService.recordSmsDelivery(false, duration).catch(() => {});
            }
            throw error;
        }
    }
}