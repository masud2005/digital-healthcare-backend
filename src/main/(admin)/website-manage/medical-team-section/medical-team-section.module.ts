import { Module } from "@nestjs/common";
import { MedicalTeamSectionController } from "./medical-team-section.controller";
import { MedicalTeamSectionService } from "./medical-team-section.service";

@Module({
    controllers: [MedicalTeamSectionController],
    providers: [MedicalTeamSectionService],
})
export class MedicalTeamSectionModule {}
