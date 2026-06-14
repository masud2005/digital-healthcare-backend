import { Module } from "@nestjs/common";
import { AssessmentSubmissionModule } from "./assessment-submission/assessment-submission.module";

@Module({
    imports: [AssessmentSubmissionModule],
})
export class PatientModule {}
