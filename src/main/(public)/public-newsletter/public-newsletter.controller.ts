import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiCreatedResponse } from "@nestjs/swagger";
import { PublicNewsletterService } from "./public-newsletter.service";
import { CreateNewsletterDto } from "./dto/create-newsletter.dto";

@ApiTags("(Public) Newsletter")
@Controller("public/newsletter")
export class PublicNewsletterController {
    constructor(private readonly newsletterService: PublicNewsletterService) {}

    @Post()
    @ApiOperation({ summary: "Subscribe to the newsletter" })
    @ApiCreatedResponse({ description: "Subscribed successfully" })
    async subscribe(@Body() payload: CreateNewsletterDto) {
        const data = await this.newsletterService.subscribe(payload);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: "You have subscribed to our newsletter successfully.",
            data,
        };
    }
}
