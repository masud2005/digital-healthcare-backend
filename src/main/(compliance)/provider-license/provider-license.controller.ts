import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Query,
    Res,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProduces,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { ProviderLicenseService } from "./provider-license.service";
import { CreateProviderLicenseDto } from "./dto/create-provider-license.dto";
import { UpdateProviderLicenseDto } from "./dto/update-provider-license.dto";
import { ProviderLicenseQueryDto } from "./dto/provider-license-query.dto";
import { ProviderLicenseParamDto } from "./dto/provider-license-param.dto";
import {
    ProviderLicenseListResponseDto,
    ProviderLicenseResponseDto,
    ProviderLicenseStatsResponseDto,
} from "./dto/provider-license-response.dto";
import { OptionalJwtAuthGuard } from "@common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@main/auth/auth.types";

@ApiTags("(Compliance) Provider Licensing")
@Controller("compliance/provider-licenses")
export class ProviderLicenseController {
    constructor(private readonly providerLicenseService: ProviderLicenseService) {}

    @Get("stats")
    @ApiOperation({ summary: "Get provider license stats (totals, expiring soon, expired)" })
    @ApiOkResponse({ type: ProviderLicenseStatsResponseDto })
    getStats() {
        return this.providerLicenseService.getStats();
    }

    @Get()
    @ApiOperation({ summary: "List provider licenses with filtering and pagination" })
    @ApiOkResponse({ type: ProviderLicenseListResponseDto })
    findAll(@Query() query: ProviderLicenseQueryDto) {
        return this.providerLicenseService.findAll(query);
    }

    @Get("export")
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Export provider licenses as CSV" })
    @ApiProduces("text/csv")
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "licenseStatus", required: false })
    @ApiQuery({ name: "insuranceStatus", required: false })
    @ApiQuery({ name: "licenseSource", required: false })
    @ApiQuery({ name: "licenseState", required: false })
    @ApiQuery({ name: "licenseType", required: false })
    @ApiQuery({ name: "isActive", required: false })
    async export(
        @Query() query: Omit<ProviderLicenseQueryDto, "page" | "limit">,
        @Res({ passthrough: false }) res: Response,
        @CurrentUser() user?: AuthenticatedUser,
    ) {
        const csvContent = await this.providerLicenseService.exportCsv(query, user);

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `provider-licenses-${timestamp}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Cache-Control", "no-cache");
        res.send(csvContent);
    }

    @Post()
    @ApiOperation({ summary: "Create a provider license record" })
    @ApiCreatedResponse({ type: ProviderLicenseResponseDto })
    create(@Body() payload: CreateProviderLicenseDto) {
        return this.providerLicenseService.create(payload);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a provider license by ID" })
    @ApiOkResponse({ type: ProviderLicenseResponseDto })
    findOne(@Param() params: ProviderLicenseParamDto) {
        return this.providerLicenseService.findOne(params.id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update a provider license" })
    @ApiOkResponse({ type: ProviderLicenseResponseDto })
    update(@Param() params: ProviderLicenseParamDto, @Body() payload: UpdateProviderLicenseDto) {
        return this.providerLicenseService.update(params.id, payload);
    }

    @Delete(":id")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete a provider license record" })
    @ApiNoContentResponse({ description: "Provider license deleted successfully" })
    async remove(@Param() params: ProviderLicenseParamDto) {
        await this.providerLicenseService.remove(params.id);
    }
}
