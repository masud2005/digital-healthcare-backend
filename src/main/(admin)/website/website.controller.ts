import { Body, Controller, Get, Patch, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdateWebsiteSettingsDto } from "./dto/update-website-settings.dto";
import { WebsiteSettingsResponseDto } from "./dto/website-settings-response.dto";
import { WebsiteService } from "./website.service";

@ApiTags("(Admin) Website Settings")
@Controller("admin/website-settings")
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) {}

    @Get()
    @ApiOperation({ summary: "Get website settings" })
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    getSettings() {
        return this.websiteService.getSettings();
    }

    @Patch()
    @ApiOperation({ summary: "Update website settings" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: UpdateWebsiteSettingsDto,
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "whiteLogo", maxCount: 1 },
            { name: "blackLogo", maxCount: 1 },
            { name: "faviconLight", maxCount: 1 },
            { name: "faviconDark", maxCount: 1 },
            { name: "socialPreview", maxCount: 1 },
        ]),
    )
    @ApiOkResponse({ type: WebsiteSettingsResponseDto })
    updateSettings(
        @Body() payload: UpdateWebsiteSettingsDto,
        @UploadedFiles()
        files: {
            whiteLogo?: Express.Multer.File[];
            blackLogo?: Express.Multer.File[];
            faviconLight?: Express.Multer.File[];
            faviconDark?: Express.Multer.File[];
            socialPreview?: Express.Multer.File[];
        },
    ) {
        return this.websiteService.updateSettings(payload, files);
    }
}
