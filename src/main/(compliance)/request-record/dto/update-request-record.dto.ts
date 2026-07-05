import { PartialType } from "@nestjs/swagger";
import { CreateRequestRecordDto } from "./create-request-record.dto";

export class UpdateRequestRecordDto extends PartialType(CreateRequestRecordDto) {}
