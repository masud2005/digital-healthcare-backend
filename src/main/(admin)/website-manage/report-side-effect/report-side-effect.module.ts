import { Module } from "@nestjs/common";
import { ReportSideEffectController } from "./report-side-effect.controller";
import { ReportSideEffectService } from "./report-side-effect.service";

@Module({
    controllers: [ReportSideEffectController],
    providers: [ReportSideEffectService],
})
export class ReportSideEffectModule {}
