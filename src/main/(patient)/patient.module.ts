import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";
import { ServiceCategoryModule } from "./service/service-category.module";

@Module({
    imports: [AssessmentSubmissionModule, ServiceCategoryModule],
})
export class PatientModule {}
