import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { AuthModule } from "@main/auth/auth.module";
import { Module } from "@nestjs/common";
import { AuditLogModule } from "../../(compliance)/audit-log/audit-log.module";
import { AssessmentSubmissionController } from "./assessment-submission.controller";
import { AssessmentSubmissionRepository } from "./assessment-submission.repository";
import { AssessmentSubmissionService } from "./assessment-submission.service";

@Module({
    imports: [PrismaModule, StorageModule, AuthModule, AuditLogModule],
    controllers: [AssessmentSubmissionController],
    providers: [AssessmentSubmissionService, AssessmentSubmissionRepository],
})
export class AssessmentSubmissionModule {}
