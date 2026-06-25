import { Injectable } from "@nestjs/common";
import { MailService } from "@global/mail/mail.service";
import { buildDoctorCredentialEmail } from "../templates/doctor-credential-email-template";

@Injectable()
export class DoctorMailService {
    constructor(private readonly mailService: MailService) {}

    assertReady() {
        this.mailService.assertConfigured();
    }

    async sendCredentials(input: { name: string; email: string; password: string }) {
        this.assertReady();
        const { subject, text, html } = buildDoctorCredentialEmail(input);

        await this.mailService.sendMail({
            to: input.email,
            subject,
            text,
            html,
        });
    }
}
