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
import { ConsentService } from "./consent.service";
import { CreateConsentDto } from "./dto/create-consent.dto";
import { ConsentQueryDto } from "./dto/consent-query.dto";
import { CookieConsentDto } from "./dto/cookie-consent.dto";
import {
    ConsentListResponseDto,
    ConsentResponseDto,
    ConsentStatsResponseDto,
} from "./dto/consent-response.dto";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { OptionalJwtAuthGuard, JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { RequirePermissions } from "@common/decorators";
import { AppPermission } from "@common/auth/permissions.constants";
import type { AuthenticatedUser } from "@main/auth/auth.types";

@ApiTags("(Compliance) Consent Management")
@Controller("compliance/consents")
export class ConsentController {
    constructor(private readonly consentService: ConsentService) {}

    @Post("cookies")
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Confirm cookie consent preferences (ANALYTICS and MARKETING)" })
    confirmCookies(@Body() payload: CookieConsentDto, @CurrentUser() user?: AuthenticatedUser) {
        return this.consentService.confirmCookies(payload, user);
    }

    @Get("stats")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get consent stats overview" })
    @ApiOkResponse({ type: ConsentStatsResponseDto })
    getStats() {
        return this.consentService.getStats();
    }

    @Get()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get consent logs with filtering and pagination" })
    @ApiOkResponse({ type: ConsentListResponseDto })
    findAll(@Query() query: ConsentQueryDto) {
        return this.consentService.findAll(query);
    }

    @Get("export")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Export consents as CSV" })
    @ApiProduces("text/csv")
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "role", required: false })
    @ApiQuery({ name: "type", required: false })
    @ApiQuery({ name: "status", required: false })
    @ApiQuery({ name: "source", required: false })
    @ApiQuery({ name: "startDate", required: false })
    @ApiQuery({ name: "endDate", required: false })
    async export(
        @Query("search") search?: string,
        @Query("role") role?: string,
        @Query("type") type?: any,
        @Query("status") status?: any,
        @Query("source") source?: any,
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string,
        @Res({ passthrough: false }) res?: Response,
        @CurrentUser() user?: AuthenticatedUser,
    ) {
        const csvContent = await this.consentService.exportCsv(
            {
                search,
                role,
                type,
                status,
                source,
                startDate,
                endDate,
            },
            user,
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const filename = `consent-logs-${timestamp}.csv`;

        res!.setHeader("Content-Type", "text/csv; charset=utf-8");
        res!.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res!.setHeader("Cache-Control", "no-cache");
        res!.send(csvContent);
    }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Submit patient consent (authenticates optionally)" })
    @ApiCreatedResponse({ type: ConsentResponseDto })
    create(@Body() payload: CreateConsentDto, @CurrentUser() user?: AuthenticatedUser) {
        return this.consentService.create(payload, user);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.VIEW_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get single consent log details" })
    @ApiOkResponse({ type: ConsentResponseDto })
    findOne(@Param("id") id: string) {
        return this.consentService.findOne(id);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update consent details" })
    @ApiOkResponse({ type: ConsentResponseDto })
    update(@Param("id") id: string, @Body() payload: Partial<CreateConsentDto>) {
        return this.consentService.update(id, payload);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions(AppPermission.MANAGE_CONSENT_MANAGEMENT)
    @ApiBearerAuth()
    @HttpCode(204)
    @ApiOperation({ summary: "Delete consent record" })
    @ApiNoContentResponse({ description: "Consent deleted successfully" })
    async remove(@Param("id") id: string) {
        await this.consentService.remove(id);
    }
}
