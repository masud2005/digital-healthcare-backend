import { StorageService } from "@global/storage/storage.service";
import { AuthService } from "@main/auth/auth.service";
import { BadRequestException, Body, Controller, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AssessmentSubmissionService } from "./assessment-submission.service";
import { CreateAssessmentSubmissionDto } from "./dto/create-assessment-submission.dto";
import { UserPayloadDto } from "./dto/user-payload.dto";

@ApiTags("Patient Assessment Submissions")
@Controller("patient/assessment-submissions")
export class AssessmentSubmissionController {
    constructor(
        private readonly assessmentSubmissionService: AssessmentSubmissionService,
        private readonly storageService: StorageService,
        private readonly authService: AuthService,
    ) {}

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userPayload: {
                    type: 'string',
                    description: 'JSON stringified UserPayloadDto. STEP 1: { email, password, confirmPassword } to request OTP. STEP 2: { email, otp } to verify & submit assessment',
                    example: JSON.stringify({
                        email: 'masud.rana@example.com',
                        password: 'securePassword123',
                        confirmPassword: 'securePassword123',
                    }),
                    examples: {
                        step1: {
                            value: JSON.stringify({
                                email: 'masud.rana@example.com',
                                password: 'securePassword123',
                                confirmPassword: 'securePassword123',
                            }),
                            description: 'Step 1: Request OTP (will auto-detect registration vs login)',
                        },
                        step2: {
                            value: JSON.stringify({
                                email: 'masud.rana@example.com',
                                otp: '123456',
                            }),
                            description: 'Step 2: Verify OTP & submit assessment',
                        },
                    },
                },
                assessmentPayload: {
                    type: 'string',
                    description: 'JSON stringified CreateAssessmentSubmissionDto. ONLY required in STEP 2 (when otp is present)',
                    example: JSON.stringify({
                        assessmentId: 'a1b2c3d4-1111-2222-3333-444455556666',
                        answers: [
                            { questionId: '9c2d34a5-f6eb-4c7e-9e3d-7dcb1cf0de69', textResponse: 'I walk 3 times a week' },
                            { questionId: 'bf8cfc71-75ff-49e7-8ec8-7b6f099f0dd8', selectedOptionIds: ['8f8f4f73-9d72-4b76-a1f5-1d0d4b1f7f1e'] },
                            { questionId: 'c5a1f8d2-3b4c-4e2a-8f7d-1234567890ab', fileField: 'file_q3' },
                        ],
                    }),
                },
                file_q3: { type: 'string', format: 'binary', description: 'File for question (STEP 2 only)' },
                file_q2: { type: 'string', format: 'binary', description: 'Optional additional file field (STEP 2 only)' },
            },
            required: ['userPayload'],
        },
    })
    @ApiOperation({ 
        summary: "Assessment submission with inline auth",
        description: "STEP 1: Send { email, password, confirmPassword } for new users or { email, password } for existing users to request OTP\nSTEP 2: Send { email, otp } + assessmentPayload + files to verify & submit"
    })
    async create(
        @Body('userPayload') userPayload: string,
        @Body('assessmentPayload') assessmentPayload?: string,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const parsedUserPayload: UserPayloadDto = 
            typeof userPayload === 'string' ? JSON.parse(userPayload) : (userPayload as any);

        // STEP 1: OTP Request (email + password + confirmPassword for new users)
        if (!parsedUserPayload.otp) {
            return this.requestOtp(parsedUserPayload);
        }

        // STEP 2: Verify OTP & Submit Assessment
        return this.verifyAndSubmit(parsedUserPayload, assessmentPayload, files);
    }

    private async requestOtp(userPayload: UserPayloadDto) {
        const { email, password, confirmPassword } = userPayload;

        if (!email || !password) {
            throw new BadRequestException('STEP 1: email and password are required');
        }

        // Check if user exists
        const existingUser = await this.authService['authRepository'].findUserByEmail(email);

        if (existingUser) {
            // User exists → Login flow
            await this.authService.requestLoginOtp({ email, password });
        } else {
            // User doesn't exist → Registration flow
            if (!confirmPassword) {
                throw new BadRequestException('STEP 1 (registration): confirmPassword is required for new users');
            }
            await this.authService.requestRegisterOtp({ email, password, confirmPassword });
        }

        return { message: 'OTP sent to email. Proceed to STEP 2 with { email, otp }' };
    }

    private async verifyAndSubmit(
        userPayload: UserPayloadDto,
        assessmentPayload?: string,
        files?: Express.Multer.File[],
    ) {
        const { email, otp } = userPayload;

        if (!email || !otp) {
            throw new BadRequestException('STEP 2: email and otp are required');
        }

        if (!assessmentPayload) {
            throw new BadRequestException('STEP 2: assessmentPayload is required');
        }

        // Verify OTP & get authenticated user (auto-detects purpose)
        const authResponse = await this.authService.verifyOtpAuto(email, otp);

        // Parse assessment payload
        const body: CreateAssessmentSubmissionDto =
            typeof assessmentPayload === 'string' ? JSON.parse(assessmentPayload) : (assessmentPayload as any);

        // Handle file uploads
        if (files && files.length > 0) {
            const filesMap = new Map(files.map((f) => [f.fieldname, f]));

            for (const answer of body.answers) {
                if (answer.fileField) {
                    const file = filesMap.get(answer.fileField);

                    if (file) {
                        const uploaded = await this.storageService.uploadFile(file);
                        answer.textResponse = uploaded.url;
                    }
                }
            }
        }

        // Create assessment submission
        const submission = await this.assessmentSubmissionService.create(authResponse.user.id, body);

        return {
            accessToken: authResponse.accessToken,
            user: authResponse.user,
            submission,
        };
    }
}
