import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AssessmentSubmissionService } from "./assessment-submission.service";
import { AssessmentSubmissionResponseDto } from "./dto/assessment-submission-response.dto";
import { CreateAssessmentSubmissionDto } from "./dto/create-assessment-submission.dto";

@ApiTags("Patient Assessment Submissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/assessment-submissions")
export class AssessmentSubmissionController {
    constructor(private readonly assessmentSubmissionService: AssessmentSubmissionService) {}

    @Post()
    @ApiOperation({
        summary: "Submit an assessment for the authenticated patient",
        description:
            "Requires a Bearer access token. Rules by admin question type: INFORMATION_ONLY is display-only and must be omitted from answers; INPUT requires textResponse; SINGLE_CHOICE requires exactly one selectedOptionId; MULTIPLE_CHOICE requires one or more selectedOptionIds. For attachment answers, upload the file through POST /attachments/upload with context ASSESSMENT_FILE first, then submit the returned attachment data.id or data.fileUrl as textResponse for the related INPUT question.",
    })
    @ApiBody({
        type: CreateAssessmentSubmissionDto,
        examples: {
            input: {
                summary: "INPUT question",
                description: "Use textResponse for admin questions created with type INPUT.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69",
                            textResponse: "I walk 3 times a week",
                        },
                    ],
                },
            },
            singleChoice: {
                summary: "SINGLE_CHOICE question",
                description: "Send exactly one option id for admin questions created with type SINGLE_CHOICE.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8",
                            selectedOptionIds: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"],
                        },
                    ],
                },
            },
            multipleChoice: {
                summary: "MULTIPLE_CHOICE question",
                description: "Send one or more option ids for admin questions created with type MULTIPLE_CHOICE.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "6f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e",
                            selectedOptionIds: [
                                "088d7df7-79e6-4a41-9ce2-c2cf02bdc1aa",
                                "927c27cc-c31b-4bf4-a865-025f3b1f7b83",
                            ],
                        },
                    ],
                },
            },
            informationOnly: {
                summary: "INFORMATION_ONLY question",
                description:
                    "Do not submit an answer for INFORMATION_ONLY questions. Submit only answerable questions from the same assessment.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69",
                            textResponse: "Information-only question was displayed to the patient; this answer is for the next INPUT question.",
                        },
                    ],
                },
            },
            attachmentInput: {
                summary: "Attachment reference",
                description:
                    "Upload the file first using POST /attachments/upload with context ASSESSMENT_FILE. Then submit one answer object where questionId is the INPUT/file question id and textResponse is the returned attachment data.id or data.fileUrl string.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "c5a1f8d2-3b4c-4e2a-8f7d-1234567890ab",
                            textResponse: "7ac8d7e2-4c27-4cb1-b1d4-1c4a0a0c7f6f",
                        },
                    ],
                },
            },
            attachmentFileUrl: {
                summary: "Attachment fileUrl alternative",
                description:
                    "If your client stores the attachment URL instead of the attachment id, submit the returned data.fileUrl as textResponse. Keep selectedOptionIds empty/omitted.",
                value: {
                    assessmentId: "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f",
                    answers: [
                        {
                            questionId: "c5a1f8d2-3b4c-4e2a-8f7d-1234567890ab",
                            textResponse: "https://signed-url.example.com/assessment-file.pdf",
                        },
                    ],
                },
            },
        },
    })
    @ApiCreatedResponse({ type: AssessmentSubmissionResponseDto })
    create(@Body() payload: CreateAssessmentSubmissionDto, @CurrentUser() user: AuthenticatedUser) {
        return this.assessmentSubmissionService.create(user.id, payload);
    }
}
