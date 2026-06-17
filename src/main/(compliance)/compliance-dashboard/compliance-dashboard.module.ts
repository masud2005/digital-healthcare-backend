import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { ConsentModule } from "../consent/consent.module";
import { IncidentModule } from "../incident/incident.module";
import { ProviderLicenseModule } from "../provider-license/provider-license.module";
import { ComplianceDashboardController } from "./compliance-dashboard.controller";
import { ComplianceDashboardService } from "./compliance-dashboard.service";

@Module({
    imports: [PrismaModule, AuditLogModule, ConsentModule, IncidentModule, ProviderLicenseModule],
    controllers: [ComplianceDashboardController],
    providers: [ComplianceDashboardService],
    exports: [ComplianceDashboardService],
})
export class ComplianceDashboardModule {}
