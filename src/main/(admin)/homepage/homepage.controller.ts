import { Body, Controller, Get, Patch, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
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
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: UpdateHomePageContentDto })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "heroImage", maxCount: 1 },
            { name: "heroBadgeImage", maxCount: 1 },
        ]),
    )
    @ApiOkResponse({ type: HomePageContentResponseDto })
    updateContent(
        @Body() payload: UpdateHomePageContentDto,
        @UploadedFiles()
        files: {
            heroImage?: Express.Multer.File[];
            heroBadgeImage?: Express.Multer.File[];
        },
    ) {
        return this.homePageService.updateContent(payload, files);
    }
}
