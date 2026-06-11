import { Module } from "@nestjs/common";
import { IncidentModule } from "./incident/incident.module";
import { SystemHealthModule } from "./system-health/system-health.module";

@Module({
    imports: [SystemHealthModule, IncidentModule],
})
export class ComplianceModule {}
