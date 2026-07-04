import { Module } from "@nestjs/common";
import { EligibilityController } from "./eligibility.controller";
import { EligibilityService } from "./eligibility.service";
import { EligibilityRepository } from "./eligibility.repository";

@Module({
    controllers: [EligibilityController],
    providers: [EligibilityService, EligibilityRepository],
})
export class EligibilityModule {}
