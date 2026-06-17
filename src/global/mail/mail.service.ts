import { SystemHealthService } from "@main/(compliance)/system-healthar/system-health.service";
import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
    private readonly logger = new Logger(MailService.name);
    private readonly transporter = this.createTransporter();

    constructor(private readonly systemHealthService: SystemHealthService) {}

    async onModuleInit() {
        if (!this.transporter) {
            this.logger.warn("SMTP is not configured. Email delivery is disabled.");
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

    async sendMail(options: {
        to: string;
        subject: string;
        text?: string;
        html?: string;
        attachments?: Array<{ filename: string; content: Buffer }>;
    }) {
        if (!this.transporter) {
            if (process.env.MAIL_LOG_OTP_WHEN_UNCONFIGURED === "true") {
                this.logger.warn(
                    `SMTP is not configured. Email to ${options.to}: Subject: ${options.subject}`,
                );
                return;
            }

            throw new ServiceUnavailableException("Email provider is not configured");
        }

        const startTime = Date.now();
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: options.attachments,
            });
            const duration = Date.now() - startTime;
            await this.systemHealthService.recordEmailDelivery(true, duration).catch(() => {});
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.systemHealthService.recordEmailDelivery(false, duration).catch(() => {});
            this.logger.error(`Failed to send email to ${options.to}`, error as Error);
            throw new ServiceUnavailableException("Unable to send email");
        }
    }
}
