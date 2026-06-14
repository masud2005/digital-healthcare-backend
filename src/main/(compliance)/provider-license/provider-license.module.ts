import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { ExportModule } from "@global/export/export.module";
import { ProviderLicenseController } from "./provider-license.controller";
import { ProviderLicenseRepository } from "./provider-license.repository";
import { ProviderLicenseService } from "./provider-license.service";

@Module({
    imports: [PrismaModule, ExportModule],
    controllers: [ProviderLicenseController],
    providers: [ProviderLicenseService, ProviderLicenseRepository],
    exports: [ProviderLicenseService, ProviderLicenseRepository],
})
export class ProviderLicenseModule {}
