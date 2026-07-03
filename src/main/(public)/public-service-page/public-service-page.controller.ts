import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicServicePageService } from "./public-service-page.service";

@ApiTags("(Public) Service Page")
@Controller("public/service-page")
export class PublicServicePageController {
    constructor(private readonly servicePageService: PublicServicePageService) {}

    @Get(":categoryId")
    @ApiOperation({ summary: "Get all sections for a service page by category ID" })
    getServicePage(@Param("categoryId") categoryId: string) {
        return this.servicePageService.getServicePageByCategoryId(categoryId);
    }
}
