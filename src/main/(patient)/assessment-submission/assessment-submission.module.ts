import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { AssessmentSubmissionController } from "./assessment-submission.controller";
import { AssessmentSubmissionRepository } from "./assessment-submission.repository";
import { AssessmentSubmissionService } from "./assessment-submission.service";

@Module({
    imports: [PrismaModule],
    controllers: [AssessmentSubmissionController],
    providers: [AssessmentSubmissionService, AssessmentSubmissionRepository],
})
export class AssessmentSubmissionModule {}
