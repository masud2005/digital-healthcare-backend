import { Module } from "@nestjs/common";
import { HippaNoticeModule } from "./hippa-notice/hippa-notice.module";
import { PrivacyPolicyModule } from "./privacy-policy/privacy-policy.module";
import { TermsOfServiceModule } from "./terms-of-service/terms-of-service.module";

@Module({
    imports: [HippaNoticeModule, PrivacyPolicyModule, TermsOfServiceModule],
})
export class WebsiteManageModule {}
