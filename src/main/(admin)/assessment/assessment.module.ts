import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { AssessmentController } from "./assessment.controller";
import { AssessmentRepository } from "./assessment.repository";
import { AssessmentService } from "./assessment.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [AssessmentController],
    providers: [AssessmentService, AssessmentRepository],
})
export class AssessmentModule {}