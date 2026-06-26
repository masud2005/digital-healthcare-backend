import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { CommunicationService } from "@global/communication/communication.service";

@Injectable()
export class AuthOtpDeliveryService {
    private readonly logger = new Logger(AuthOtpDeliveryService.name);

    constructor(private readonly communicationService: CommunicationService) {}

    private getAction(purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD") {
        return `OTP_${purpose}` as const;
    }

    async sendOtpEmail(
        email: string,
        name: string,
        code: string,
        purpose: "LOGIN" | "REGISTER" | "FORGOT_PASSWORD",
    ) {
        try {
            await this.communicationService.dispatch({
                action: this.getAction(purpose),
                channel: "EMAIL",
                to: email,
                payload: { name, code, purpose },
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
        try {
            await this.communicationService.dispatch({
                action: this.getAction(purpose),
                channel: "SMS",
                to: phone,
                payload: { code, purpose },
            });
        } catch (error) {
            this.logger.error(`Failed to send OTP SMS to ${phone}`, error as Error);
            throw new ServiceUnavailableException("Unable to send SMS verification code");
        }
    }
}
