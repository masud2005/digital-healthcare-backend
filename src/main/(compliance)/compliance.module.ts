import { Module } from "@nestjs/common";
import { IncidentModule } from "./incident/incident.module";
import { SystemHealthModule } from "./system-health/system-health.module";
import { AuditLogModule } from "./audit-log/audit-log.module";
import { ConsentModule } from "./consent/consent.module";
import { ProviderLicenseModule } from "./provider-license/provider-license.module";
import { ComplianceDashboardModule } from "./compliance-dashboard/compliance-dashboard.module";
import { SideEffectReportModule } from "./side-effect-report/side-effect-report.module";

@Module({
    imports: [
        SystemHealthModule,
        IncidentModule,
        AuditLogModule,
        ConsentModule,
        ProviderLicenseModule,
        ComplianceDashboardModule,
        SideEffectReportModule,
    ],
})
export class ComplianceModule {}
