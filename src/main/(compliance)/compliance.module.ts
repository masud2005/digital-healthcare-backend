import { Module } from "@nestjs/common";
import { SystemHealthModule } from "./system-health/system-health.module";

@Module({
    imports: [SystemHealthModule],
})
export class ComplianceModule {}
