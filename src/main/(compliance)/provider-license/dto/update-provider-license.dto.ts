import { PartialType } from "@nestjs/swagger";
import { CreateProviderLicenseDto } from "./create-provider-license.dto";

export class UpdateProviderLicenseDto extends PartialType(CreateProviderLicenseDto) {}
