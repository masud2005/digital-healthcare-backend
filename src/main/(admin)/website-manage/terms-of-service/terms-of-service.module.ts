import { Module } from "@nestjs/common";
import { TermsOfServiceController } from "./terms-of-service.controller";
import { TermsOfServiceService } from "./terms-of-service.service";

@Module({
    controllers: [TermsOfServiceController],
    providers: [TermsOfServiceService],
})
export class TermsOfServiceModule {}
