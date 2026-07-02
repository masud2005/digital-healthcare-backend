import { Module } from "@nestjs/common";
import { SideEffectReportModule } from "../../(compliance)/side-effect-report/side-effect-report.module";
import { PublicSideEffectReportController } from "./public-side-effect-report.controller";

@Module({
    imports: [SideEffectReportModule],
    controllers: [PublicSideEffectReportController],
})
export class PublicSideEffectReportModule {}
