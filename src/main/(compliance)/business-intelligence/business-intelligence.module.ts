import { PrismaModule } from "@global/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { BusinessIntelligenceController } from "./business-intelligence.controller";
import { BusinessIntelligenceRepository } from "./business-intelligence.repository";
import { BusinessIntelligenceService } from "./business-intelligence.service";

@Module({
    imports: [PrismaModule],
    controllers: [BusinessIntelligenceController],
    providers: [BusinessIntelligenceService, BusinessIntelligenceRepository],
})
export class BusinessIntelligenceModule {}
