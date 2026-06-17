import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { ExportModule } from "@global/export/export.module";
import { IncidentModule } from "../incident/incident.module";
import { ProviderLicenseController } from "./provider-license.controller";
import { ProviderLicenseRepository } from "./provider-license.repository";
import { ProviderLicenseService } from "./provider-license.service";

@Module({
    imports: [PrismaModule, ExportModule, IncidentModule],
    controllers: [ProviderLicenseController],
    providers: [ProviderLicenseService, ProviderLicenseRepository],
    exports: [ProviderLicenseService, ProviderLicenseRepository],
})
export class ProviderLicenseModule {}
