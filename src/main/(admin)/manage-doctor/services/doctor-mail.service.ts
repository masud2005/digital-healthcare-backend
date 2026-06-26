import { Injectable } from "@nestjs/common";
import { CommunicationService } from "@global/communication/communication.service";

@Injectable()
export class DoctorMailService {
    constructor(private readonly communicationService: CommunicationService) {}

    assertReady() {
        // Validation could be added here if needed, but CommunicationService handles failures internally.
    }

    async sendCredentials(input: { name: string; email: string; password: string }) {
        await this.communicationService.dispatch({
            action: "DOCTOR_CREDENTIALS",
            channel: "EMAIL",
            to: input.email,
            payload: {
                name: input.name,
                email: input.email,
                password: input.password,
            },
        });
    }
}
