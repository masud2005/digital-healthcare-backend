import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { buildOtpEmail } from "../templates/auth-email-template";
import { buildOtpSms } from "../templates/auth-sms-template";
import { MailService } from "@global/mail/mail.service";
import { SystemHealthService } from "../../(compliance)/system-health/system-health.service";

@Injectable()
export class AuthOtpDeliveryService {
    private readonly logger = new Logger(AuthOtpDeliveryService.name);

    constructor(
        private readonly mailService: MailService,
        private readonly systemHealthService: SystemHealthService,
    ) {}

    async sendOtpEmail(
        email: string,
        name: string,
        code: string,
        purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD",
    ) {
        const { subject, text, html } = buildOtpEmail({ name, code, purpose });

        try {
            await this.mailService.sendMail({
                to: email,
                subject,
                text,
                html,
            });
        } catch (error) {
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
