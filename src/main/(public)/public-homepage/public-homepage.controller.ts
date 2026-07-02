import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HomePageService } from "../../(admin)/homepage/homepage.service";
import { HomePageContentResponseDto } from "../../(admin)/homepage/dto/homepage-response.dto";

@ApiTags("(Public) Home Page")
@Controller("public/homepage-content")
export class PublicHomePageController {
    constructor(private readonly homePageService: HomePageService) {}

    @Get()
    @ApiOperation({ summary: "Get homepage content" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    async getContent() {
        const data = await this.homePageService.getContent();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Homepage content fetched successfully",
            data,
        };
    }
}
