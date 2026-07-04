import { Controller, Get, HttpStatus, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import * as express from "express";
import { JwtAuthGuard, PermissionsGuard } from "@common/guards";
import { RequirePermissions } from "@common/decorators";
import { AppPermission } from "@common/auth/permissions.constants";
import { NewsletterService } from "./newsletter.service";
import { NewsletterQueryDto } from "./dto/newsletter-query.dto";

@ApiTags("(Admin) Newsletter")
@Controller("admin/newsletters")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) {}

    @Get()
    @RequirePermissions(AppPermission.VIEW_NEWSLETTER)
    @ApiOperation({ summary: "Get all newsletter subscribers (paginated, searchable)" })
    async getSubscribers(@Query() query: NewsletterQueryDto) {
        const data = await this.newsletterService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Subscribers retrieved successfully",
            ...data,
        };
    }

    @Get("stats")
    @RequirePermissions(AppPermission.VIEW_NEWSLETTER)
    @ApiOperation({ summary: "Get newsletter analytics and statistics" })
    async getStats() {
        const data = await this.newsletterService.getStats();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: "Newsletter statistics retrieved successfully",
            data,
        };
    }

    @Get("export")
    @RequirePermissions(AppPermission.MANAGE_NEWSLETTER)
    @ApiOperation({ summary: "Export newsletter subscribers list as CSV" })
    async exportSubscribers(@Res() res: express.Response) {
        const csvContent = await this.newsletterService.exportCsv();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=newsletter_subscribers.csv");
        res.status(HttpStatus.OK).send(csvContent);
    }
}
