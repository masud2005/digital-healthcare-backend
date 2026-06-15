import { Module } from "@nestjs/common";
import { PrismaModule } from "@global/prisma/prisma.module";
import { SideEffectReportController } from "./side-effect-report.controller";
import { SideEffectReportRepository } from "./side-effect-report.repository";
import { SideEffectReportService } from "./side-effect-report.service";

@Module({
    imports: [PrismaModule],
    controllers: [SideEffectReportController],
    providers: [SideEffectReportService, SideEffectReportRepository],
    exports: [SideEffectReportService],
})
export class SideEffectReportModule {}
