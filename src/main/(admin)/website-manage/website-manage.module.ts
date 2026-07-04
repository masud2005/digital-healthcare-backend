import { Module } from "@nestjs/common";
import { HippaNoticeModule } from "./hippa-notice/hippa-notice.module";
import { PrivacyPolicyModule } from "./privacy-policy/privacy-policy.module";
import { TermsOfServiceModule } from "./terms-of-service/terms-of-service.module";
import { CoverageSectionModule } from "./coverage-section/coverage-section.module";
import { MedicalTeamSectionModule } from "./medical-team-section/medical-team-section.module";
import { ContactSideWidgetModule } from "./contact-side-widget/contact-side-widget.module";
import { ContactPartnerSectionModule } from "./contact-partner-section/contact-partner-section.module";

@Module({
    imports: [
        HippaNoticeModule,
        PrivacyPolicyModule,
        TermsOfServiceModule,
        CoverageSectionModule,
        MedicalTeamSectionModule,
        ContactSideWidgetModule,
        ContactPartnerSectionModule,
    ],
})
export class WebsiteManageModule {}
