import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HomePageContentResponseDto } from "./dto/homepage-response.dto";
import { UpdateHomePageContentDto } from "./dto/update-homepage.dto";
import { HomePageService } from "./homepage.service";

@ApiTags("(Admin) Home Page")
@Controller("admin/homepage-content")
export class HomePageController {
    constructor(private readonly homePageService: HomePageService) {}

    @Get()
    @ApiOperation({ summary: "Get homepage content" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    getContent() {
        return this.homePageService.getContent();
    }

    @Patch()
    @ApiOperation({ summary: "Update homepage content" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    updateContent(
        @Body() payload: UpdateHomePageContentDto,
    ) {
        return this.homePageService.updateContent(payload);
    }
}
