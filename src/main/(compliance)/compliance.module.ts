import { Module } from "@nestjs/common";
import { IncidentModule } from "./incident/incident.module";
import { SystemHealthModule } from "./system-health/system-health.module";
import { AuditLogModule } from "./audit-log/audit-log.module";
import { ConsentModule } from "./consent/consent.module";

@Module({
    imports: [SystemHealthModule, IncidentModule, AuditLogModule, ConsentModule],
})
export class ComplianceModule {}
