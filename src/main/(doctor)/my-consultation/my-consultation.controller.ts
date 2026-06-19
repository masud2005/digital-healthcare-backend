import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { AssessmentSubmissionService } from "@main/(patient)/assessment-submission/assessment-submission.service";
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ConsultationTab, DoctorConsultationListResponseDto, UpdateConsultationStatusDto } from "./dto/my-consultation.dto";
import { DoctorMyConsultationService } from "./my-consultation.service";

@ApiTags("(Doctor) My Consultations")
@ApiBearerAuth()
@Controller("doctor/my-consultation")
export class DoctorMyConsultationController {
    constructor(
        private readonly myConsultationService: DoctorMyConsultationService,
        private readonly assessmentSubmissionService: AssessmentSubmissionService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    @ApiOperation({
        summary: "Get my consultations (list view)",
        description: "Returns consultations filtered by tab and includes the counts for the tabs.",
    })
    @ApiQuery({ name: "tab", enum: ConsultationTab, required: false })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    @ApiOkResponse({ type: DoctorConsultationListResponseDto })
    async getMyConsultations(
        @CurrentUser() user: AuthenticatedUser,
        @Query("tab") tab?: ConsultationTab,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
    ) {
        const result = await this.myConsultationService.getMyConsultations(
            user.id,
            tab,
            page ? Number(page) : undefined,
            limit ? Number(limit) : undefined,
        );
        return {
            success: true,
            statusCode: 200,
            message: "Consultations retrieved successfully",
            ...result,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    @ApiOperation({
        summary: "Get a specific consultation (assessment blueprint)",
        description: "Returns the complete assessment blueprint mapping for a specific consultation.",
    })
    async getConsultation(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
        const result = await this.assessmentSubmissionService.getMyAssessmentBlueprint(id, {
            doctorId: user.id,
        });

        return {
            success: true,
            statusCode: 200,
            message: "Consultation retrieved successfully",
            data: result,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch("status/:id")
    @ApiOperation({
        summary: "Update the status of a consultation",
        description: "Allows a doctor to ACCEPT, REVIEW, REJECT, or request a refill for a consultation.",
    })
    @ApiBody({ type: UpdateConsultationStatusDto })
    async updateConsultationStatus(
        @Param("id") id: string,
        @Body() body: UpdateConsultationStatusDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        await this.myConsultationService.updateStatus(id, user.id, body);

        return {
            success: true,
            statusCode: 200,
            message: "Consultation status updated successfully",
        };
    }
}
