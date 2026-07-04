import { Module } from "@nestjs/common";
import { HippaNoticeModule } from "./hippa-notice/hippa-notice.module";
import { PrivacyPolicyModule } from "./privacy-policy/privacy-policy.module";
import { TermsOfServiceModule } from "./terms-of-service/terms-of-service.module";
import { CoverageSectionModule } from "./coverage-section/coverage-section.module";
import { MedicalTeamSectionModule } from "./medical-team-section/medical-team-section.module";

@Module({
    imports: [
        HippaNoticeModule,
        PrivacyPolicyModule,
        TermsOfServiceModule,
        CoverageSectionModule,
        MedicalTeamSectionModule,
    ],
})
export class WebsiteManageModule {}
