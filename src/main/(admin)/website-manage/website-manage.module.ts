import { Module } from "@nestjs/common";
import { AboutUsModule } from "./about-us/about-us.module";
import { ContactPartnerSectionModule } from "./contact-partner-section/contact-partner-section.module";
import { ContactSideWidgetModule } from "./contact-side-widget/contact-side-widget.module";
import { CoverageSectionModule } from "./coverage-section/coverage-section.module";
import { EligibilityModule } from "./eligibility/eligibility.module";
import { HippaNoticeModule } from "./hippa-notice/hippa-notice.module";
import { HowItWorksModule } from "./how-it-works/how-it-works.module";
import { LabTestingModule } from "./lab-testing/lab-testing.module";
import { MedicalTeamSectionModule } from "./medical-team-section/medical-team-section.module";
import { PrivacyPolicyModule } from "./privacy-policy/privacy-policy.module";
import { ReportSideEffectModule } from "./report-side-effect/report-side-effect.module";
import { RequestRecordsModule } from "./request-records/request-records.module";
import { ShippingInfoModule } from "./shipping-info/shipping-info.module";
import { TermsOfServiceModule } from "./terms-of-service/terms-of-service.module";

@Module({
    imports: [
        HippaNoticeModule,
        PrivacyPolicyModule,
        TermsOfServiceModule,
        CoverageSectionModule,
        MedicalTeamSectionModule,
        ContactSideWidgetModule,
        ContactPartnerSectionModule,
        LabTestingModule,
        ReportSideEffectModule,
        AboutUsModule,
        RequestRecordsModule,
        HowItWorksModule,
        EligibilityModule,
        ShippingInfoModule,
    ],
})
export class WebsiteManageModule {}
