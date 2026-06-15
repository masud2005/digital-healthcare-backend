import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { StateCoverageController } from "./state-coverage.controller";
import { StateCoverageRepository } from "./state-coverage.repository";
import { StateCoverageService } from "./state-coverage.service";

@Module({
    imports: [PrismaModule],
    controllers: [StateCoverageController],
    providers: [StateCoverageService, StateCoverageRepository],
    exports: [StateCoverageService],
})
export class StateCoverageModule {}
