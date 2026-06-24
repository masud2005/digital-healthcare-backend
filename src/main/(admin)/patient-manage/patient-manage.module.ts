import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { AssessmentSubmissionModule } from "@main/(patient)/assessment-submission/assessment-submission.module";
import { Module } from "@nestjs/common";
import { NotificationModule } from "../../notification/notification.module";
import { PatientManageController } from "./patient-manage.controller";
import { PatientManageRepository } from "./patient-manage.repository";
import { PatientManageService } from "./patient-manage.service";

@Module({
    imports: [PrismaModule, StorageModule, AssessmentSubmissionModule, NotificationModule],
    controllers: [PatientManageController],
    providers: [PatientManageService, PatientManageRepository],
})
export class PatientManageModule {}
