import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { AssessmentSubmissionModule } from "@main/(patient)/assessment-submission/assessment-submission.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { DoctorMyConsultationController } from "./my-consultation.controller";
import { DoctorMyConsultationRepository } from "./my-consultation.repository";
import { DoctorMyConsultationService } from "./my-consultation.service";

@Module({
    imports: [PrismaModule, StorageModule, AssessmentSubmissionModule, NotificationModule],
    controllers: [DoctorMyConsultationController],
    providers: [DoctorMyConsultationService, DoctorMyConsultationRepository],
})
export class DoctorMyConsultationModule {}
