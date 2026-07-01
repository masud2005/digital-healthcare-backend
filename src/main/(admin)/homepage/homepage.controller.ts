import { AppPermission } from "@common/auth/permissions.constants";
import { RequirePermissions } from "@common/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HomePageContentResponseDto } from "./dto/homepage-response.dto";
import {
    UpdateAboutSectionDto,
    UpdateAssessmentSectionDto,
    UpdateHeroSectionDto,
    UpdateHowItWorksSectionDto,
    UpdateFaqSectionDto,
    UpdateProvidersSectionDto,
    UpdateTestimonialsSectionDto,
} from "./dto/update-sections.dto";
import { HomePageService } from "./homepage.service";

@ApiTags("(Admin) Home Page")
@Controller("admin/homepage-content")
export class HomePageController {
    constructor(private readonly homePageService: HomePageService) {}

    // Public — used by the frontend to render the homepage
    @Get()
    @ApiOperation({ summary: "Get homepage content" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    getContent() {
        return this.homePageService.getContent();
    }

    @Put("hero")
    @ApiOperation({ summary: "Update Hero section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateHeroSection(@Body() payload: UpdateHeroSectionDto) {
        return this.homePageService.updateHeroSection(payload);
    }

    @Put("assessment")
    @ApiOperation({ summary: "Update Assessment section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateAssessmentSection(@Body() payload: UpdateAssessmentSectionDto) {
        return this.homePageService.updateAssessmentSection(payload);
    }

    @Put("about")
    @ApiOperation({ summary: "Update About section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateAboutSection(@Body() payload: UpdateAboutSectionDto) {
        return this.homePageService.updateAboutSection(payload);
    }

    @Put("providers")
    @ApiOperation({ summary: "Update Providers section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateProvidersSection(@Body() payload: UpdateProvidersSectionDto) {
        return this.homePageService.updateProvidersSection(payload);
    }

    @Put("how-it-works")
    @ApiOperation({ summary: "Update How It Works section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateHowItWorksSection(@Body() payload: UpdateHowItWorksSectionDto) {
        return this.homePageService.updateHowItWorksSection(payload);
    }

    @Put("testimonials")
    @ApiOperation({ summary: "Update Testimonials section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateTestimonialsSection(@Body() payload: UpdateTestimonialsSectionDto) {
        return this.homePageService.updateTestimonialsSection(payload);
    }

    @Put("faq")
    @ApiOperation({ summary: "Update FAQ section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_WEBSITE_MANAGEMENT)
    updateFaqSection(@Body() payload: UpdateFaqSectionDto) {
        return this.homePageService.updateFaqSection(payload);
    }
}
