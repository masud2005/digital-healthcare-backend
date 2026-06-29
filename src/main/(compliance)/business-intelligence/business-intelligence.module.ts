import { PrismaModule } from "@global/prisma/prisma.module";
import { StorageModule } from "@global/storage/storage.module";
import { Module } from "@nestjs/common";
import { BusinessIntelligenceController } from "./business-intelligence.controller";
import { BusinessIntelligenceRepository } from "./business-intelligence.repository";
import { BusinessIntelligenceService } from "./business-intelligence.service";

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [BusinessIntelligenceController],
    providers: [BusinessIntelligenceService, BusinessIntelligenceRepository],
})
export class BusinessIntelligenceModule {}
