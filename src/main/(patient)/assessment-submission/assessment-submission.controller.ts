import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "@main/auth/auth.types";
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import { SubmissionStatus } from "@prisma/client";
import { AssessmentSubmissionService } from "./assessment-submission.service";
import { AssessmentParamDto } from "./dto/assessment-submission-param.dto";
import { AssessmentSubmissionResponseDto } from "./dto/assessment-submission-response.dto";
import { CreateAssessmentSubmissionDto } from "./dto/create-assessment-submission.dto";
import { MyAssessmentBlueprintDto, MyAssessmentSummaryResponseDto } from "./dto/my-assessment-blueprint.dto";
import { UpdateAssessmentSubmissionDto } from "./dto/update-assessment-submission.dto";

const ANSWERS_EXAMPLES = {
    informationOnly: {
        summary: "INFORMATION_ONLY — skip",
        description:
            "INFORMATION_ONLY questions are display-only (headings, notices). " +
            "Never include their questionId in the answers array.",
        answers: [
            {
                questionId: "9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69",
                textResponse:
                    "Answer for the next INPUT question, not for the INFORMATION_ONLY one above it.",
            },
        ],
    },
    inputText: {
        summary: "INPUT (TEXT) — textResponse only",
        description:
            "For INPUT questions with inputType TEXT or NUMBER: send textResponse only. " +
            "Do not send selectedOptionIds.",
        answers: [
            {
                questionId: "9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69",
                textResponse: "I walk 3 times a week",
            },
        ],
    },
    inputFile: {
        summary: "INPUT (FILE) — upload first, then textResponse",
        description:
            "For INPUT questions with inputType FILE: " +
            "1) Upload the file via POST /attachments/upload with context ASSESSMENT_FILE. " +
            "2) Pass the returned data.id or data.fileUrl as textResponse. " +
            "Do not send selectedOptionIds.",
        answers: [
            {
                questionId: "c5a1f8d2-3b4c-4e2a-8f7d-1234567890ab",
                textResponse: "7ac8d7e2-4c27-4cb1-b1d4-1c4a0a0c7f6f",
            },
        ],
    },
    singleChoice: {
        summary: "SINGLE_CHOICE — exactly one selectedOptionId",
        description:
            "For SINGLE_CHOICE questions: send selectedOptionIds with exactly one option id. " +
            "Do not send textResponse.",
        answers: [
            {
                questionId: "bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8",
                selectedOptionIds: ["8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e"],
            },
        ],
    },
    multipleChoice: {
        summary: "MULTIPLE_CHOICE — one or more selectedOptionIds",
        description:
            "For MULTIPLE_CHOICE questions: send selectedOptionIds with one or more option ids. " +
            "Do not send textResponse.",
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
    singleChoiceWithSubQuestion: {
        summary: "SINGLE_CHOICE with sub-question",
        description:
            "If a selected option has sub-questions, include those sub-question answers in the same answers array. " +
            "Sub-questions follow the same rules as top-level questions by their type. " +
            "If the parent option is NOT selected, omit all its sub-question answers.",
        answers: [
            {
                questionId: "acc65ccd-3aba-4a15-a413-955ac2b868db",
                selectedOptionIds: ["ec15d029-ca75-464c-a174-64892ba75e45"],
            },
            {
                questionId: "sub-q-1111-2222",
                textResponse: "3",
            },
        ],
    },
    fullAssessment: {
        summary: "Full assessment — all types combined",
        description:
            "Real-world example combining all question types in a single submission. " +
            "INFORMATION_ONLY questions are excluded. Sub-questions are included only for selected parent options.",
        answers: [
            {
                questionId: "acc65ccd-3aba-4a15-a413-955ac2b868db",
                selectedOptionIds: ["ec15d029-ca75-464c-a174-64892ba75e45"],
            },
            {
                questionId: "sub-q-1111-2222",
                textResponse: "3",
            },
            {
                questionId: "6068ac28-e7eb-435f-9605-0529ef19810b",
                selectedOptionIds: [
                    "97a1c4a8-f549-4755-ab6b-2880fd5e5bd8",
                    "8ed3e8d2-ddd0-41ec-ba5b-931d29396c94",
                ],
            },
            {
                questionId: "input-text-q-id",
                textResponse: "John Doe",
            },
            {
                questionId: "d501950d-8fef-403a-84ec-cd677bec0f7a",
                textResponse: "26",
            },
            {
                questionId: "input-file-q-id",
                textResponse: "7ac8d7e2-4c27-4cb1-b1d4-1c4a0a0c7f6f",
            },
        ],
    },
};

const ASSESSMENT_ID = "7f4145d8-087e-4d33-82bd-0f65d3fbdb4f";

// POST examples include assessmentId in the body
const CREATE_EXAMPLES = Object.fromEntries(
    Object.entries(ANSWERS_EXAMPLES).map(([key, { summary, description, answers }]) => [
        key,
        { summary, description, value: { assessmentId: ASSESSMENT_ID, answers } },
    ]),
);

// PATCH examples only include answers (assessmentId comes from submission, not the body)
const UPDATE_EXAMPLES = Object.fromEntries(
    Object.entries(ANSWERS_EXAMPLES).map(([key, { summary, description, answers }]) => [
        key,
        { summary, description, value: { answers } },
    ]),
);

@ApiTags("(Patient) Assessment Submissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patient/assessment-submissions")
export class AssessmentSubmissionController {
    constructor(private readonly assessmentSubmissionService: AssessmentSubmissionService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({
        summary: "Submit an assessment",
        description:
            "Submit answers for an ACTIVE assessment. Rules per question type:\n\n" +
            "• INFORMATION_ONLY — display-only (heading/notice). Omit from answers entirely.\n" +
            "• INPUT (TEXT/NUMBER) — send textResponse only. Do not send selectedOptionIds.\n" +
            "• INPUT (FILE) — upload via POST /attachments/upload (context: ASSESSMENT_FILE) first, then send returned data.id or data.fileUrl as textResponse.\n" +
            "• SINGLE_CHOICE — send selectedOptionIds with exactly one option id. Do not send textResponse.\n" +
            "• MULTIPLE_CHOICE — send selectedOptionIds with one or more option ids. Do not send textResponse.\n" +
            "• Sub-questions — include in the same answers array only when their parent option is selected. Omit otherwise.\n\n" +
            "Duplicate questionIds and answers for INFORMATION_ONLY questions will be rejected.",
    })
    @ApiBody({
        type: CreateAssessmentSubmissionDto,
        examples: CREATE_EXAMPLES,
    })
    @ApiCreatedResponse({ type: AssessmentSubmissionResponseDto })
    async create(
        @Body() payload: CreateAssessmentSubmissionDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const submission = await this.assessmentSubmissionService.create(user.id, payload);
        return {
            success: true,
            statusCode: 201,
            message: "Assessment submitted successfully",
            data: submission,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get("my-assessment/:id")
    @ApiOperation({
        summary: "Get a single submission by id",
        description:
            "Returns the full question tree with the patient's saved answers (patientAnswer) " +
            "for a specific submission. Only the owner can access it.",
    })
    @ApiOkResponse({ type: MyAssessmentBlueprintDto })
    async getMyAssessment(
        @Param() params: AssessmentParamDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const assessment = await this.assessmentSubmissionService.getMyAssessmentBlueprint(
            params.id,
            user.id,
        );
        return {
            success: true,
            statusCode: 200,
            message: "Assessment retrieved successfully",
            data: assessment,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get("my-assessment")
    @ApiOperation({
        summary: "Get my submitted assessments summary (list view)",
        description:
            "Returns a lightweight list of the patient's assessment submissions " +
            "with basic info like thumbnail, title, status, and category. " +
            "Supports filtering by status and returns a grouped counts map for all statuses.",
    })
    @ApiOkResponse({ type: MyAssessmentSummaryResponseDto })
    @ApiQuery({ name: "status", enum: SubmissionStatus, required: false, description: "Filter by assessment status" })
    async getMyAssessments(
        @CurrentUser() user: AuthenticatedUser,
        @Query("status") status?: SubmissionStatus,
    ) {
        const result = await this.assessmentSubmissionService.getMyAssessmentsSummary(
            user.id,
            status,
        );
        return {
            success: true,
            statusCode: 200,
            message: "My assessments retrieved successfully",
            data: result,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    @ApiOperation({
        summary: "Update a submission (DRAFT or REFIL_REQUESTED only)",
        description:
            "Replaces ALL existing answers with the new payload — partial update is not supported. " +
            "Only allowed when submission status is DRAFT or REFIL_REQUESTED. " +
            "Other statuses (PENDING, REVIEWED, ACCEPTED, REJECTED) will return 403. " +
            "Answer rules are identical to POST — see the POST endpoint for per-type details.",
    })
    @ApiBody({
        type: UpdateAssessmentSubmissionDto,
        examples: UPDATE_EXAMPLES,
    })
    @ApiOkResponse({ type: MyAssessmentBlueprintDto })
    async updateSubmission(
        @Param() params: AssessmentParamDto,
        @Body() payload: UpdateAssessmentSubmissionDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        const submission = await this.assessmentSubmissionService.updateSubmission(
            params.id,
            user.id,
            payload,
        );
        return {
            success: true,
            statusCode: 200,
            message: "Assessment submission updated successfully",
            data: submission,
        };
    }
}
