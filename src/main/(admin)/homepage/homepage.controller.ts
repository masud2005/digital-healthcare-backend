import { Roles } from "@common/decorators";
import { JwtAuthGuard, RolesGuard } from "@common/guards";
import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HomePageContentResponseDto } from "./dto/homepage-response.dto";
import {
    UpdateAboutSectionDto,
    UpdateBannerSectionDto,
    UpdateHeroSectionDto,
    UpdateHowItWorksSectionDto,
    UpdatePricingSectionDto,
    UpdateProductSectionDto,
    UpdateTestimonialsSectionDto,
} from "./dto/update-sections.dto";
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

    @Put("hero")
    @ApiOperation({ summary: "Update Hero section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateHeroSection(@Body() payload: UpdateHeroSectionDto) {
        return this.homePageService.updateHeroSection(payload);
    }

    @Put("banner")
    @ApiOperation({ summary: "Update Banner section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateBannerSection(@Body() payload: UpdateBannerSectionDto) {
        return this.homePageService.updateBannerSection(payload);
    }

    @Put("about")
    @ApiOperation({ summary: "Update About section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateAboutSection(@Body() payload: UpdateAboutSectionDto) {
        return this.homePageService.updateAboutSection(payload);
    }

    @Put("product")
    @ApiOperation({ summary: "Update Product section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateProductSection(@Body() payload: UpdateProductSectionDto) {
        return this.homePageService.updateProductSection(payload);
    }

    @Put("how-it-works")
    @ApiOperation({ summary: "Update How It Works section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    updateHowItWorksSection(@Body() payload: UpdateHowItWorksSectionDto) {
        return this.homePageService.updateHowItWorksSection(payload);
    }

    @Put("testimonials")
    @ApiOperation({ summary: "Update Testimonials section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updateTestimonialsSection(@Body() payload: UpdateTestimonialsSectionDto) {
        return this.homePageService.updateTestimonialsSection(payload);
    }

    @Put("pricing")
    @ApiOperation({ summary: "Update Pricing section" })
    @ApiOkResponse({ type: HomePageContentResponseDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    updatePricingSection(@Body() payload: UpdatePricingSectionDto) {
        return this.homePageService.updatePricingSection(payload);
    }
}
