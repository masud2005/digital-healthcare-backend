import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SideEffectReportService } from "../../(compliance)/side-effect-report/side-effect-report.service";
import { CreateSideEffectReportDto } from "../../(compliance)/side-effect-report/dto/create-side-effect-report.dto";
import { SideEffectReportResponseDto } from "../../(compliance)/side-effect-report/dto/side-effect-report-response.dto";

@ApiTags("(Public) Side Effect Reports")
@Controller("public/side-effect-reports")
export class PublicSideEffectReportController {
    constructor(private readonly sideEffectReportService: SideEffectReportService) {}

    @Post()
    @ApiOperation({ summary: "Create a side effect report" })
    @ApiCreatedResponse({ type: SideEffectReportResponseDto })
    create(@Body() payload: CreateSideEffectReportDto) {
        return this.sideEffectReportService.create(payload);
    }
}
