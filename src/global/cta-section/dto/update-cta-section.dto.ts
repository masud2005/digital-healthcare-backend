import { PartialType } from "@nestjs/swagger";
import { CreateCtaSectionDto } from "./create-cta-section.dto";

export class UpdateCtaSectionDto extends PartialType(CreateCtaSectionDto) {}
