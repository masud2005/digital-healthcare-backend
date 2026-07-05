import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RequestRecordService } from "../../(compliance)/request-record/request-record.service";
import { CreateRequestRecordDto } from "../../(compliance)/request-record/dto/create-request-record.dto";
import { RequestRecordResponseDto } from "../../(compliance)/request-record/dto/request-record-response.dto";

@ApiTags("(Public) Request Records")
@Controller("public/request-records")
export class PublicRequestRecordController {
    constructor(private readonly requestRecordService: RequestRecordService) {}

    @Post()
    @ApiOperation({ summary: "Create a request record request" })
    @ApiCreatedResponse({ type: RequestRecordResponseDto })
    create(@Body() payload: CreateRequestRecordDto) {
        return this.requestRecordService.create(payload);
    }
}
