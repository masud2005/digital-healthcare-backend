import { Module } from "@nestjs/common";
import { AuditLogModule } from "./audit-log/audit-log.module";
import { BusinessIntelligenceModule } from "./business-intelligence/business-intelligence.module";
import { ComplianceDashboardModule } from "./compliance-dashboard/compliance-dashboard.module";
import { ConsentModule } from "./consent/consent.module";
import { IncidentModule } from "./incident/incident.module";
import { ProviderLicenseModule } from "./provider-license/provider-license.module";
import { SideEffectReportModule } from "./side-effect-report/side-effect-report.module";
import { StateCoverageModule } from "./state-coverage/state-coverage.module";
import { SystemHealthModule } from "./system-healthar/system-health.module";

@Module({
    imports: [
        SystemHealthModule,
        IncidentModule,
        AuditLogModule,
        ConsentModule,
        ProviderLicenseModule,
        ComplianceDashboardModule,
        SideEffectReportModule,
        StateCoverageModule,
        BusinessIntelligenceModule,
    ],
})
export class ComplianceModule {}
