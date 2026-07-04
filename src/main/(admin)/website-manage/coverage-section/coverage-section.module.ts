import { Module } from "@nestjs/common";
import { CoverageSectionController } from "./coverage-section.controller";
import { CoverageSectionService } from "./coverage-section.service";

@Module({
    controllers: [CoverageSectionController],
    providers: [CoverageSectionService],
})
export class CoverageSectionModule {}
