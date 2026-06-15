import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";
import { ServiceCategoryModule } from "./service/service-category.module";

@Module({
    imports: [ServiceCategoryModule, AssessmentSubmissionModule],
})
export class PatientModule {}
